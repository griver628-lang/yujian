import type { ApiResponse } from '../types/index';

// 配置：是否使用微信云托管原生调用（免域名免备案通道）
// 若后期转传统云服务，只需将此参数改为 false，并配置 BASE_URL 即可
const USE_CLOUD_CONTAINER = true;
const CLOUD_ENV_ID = 'prod-d6gaj80107becb742';          // 微信云托管环境ID
const BASE_URL = 'https://api.periodhelper.com/api/v1'; // 传统 ECS API 地址
const CONTAINER_SERVICE_NAME = 'period-helper';         // 云托管服务名称
const CONTAINER_PATH_PREFIX = '/api/v1';                // 云托管服务内的 API 前缀

let isCloudInited = false;

/**
 * 确保云环境仅初始化一次，防止多次重复建立长连接引起底层连接被频繁重置 (ERR_CONNECTION_CLOSED)
 */
function ensureCloudInited() {
  if (isCloudInited) return;
  // @ts-ignore
  if (typeof wx !== 'undefined' && wx.cloud) {
    try {
      // @ts-ignore
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      });
      isCloudInited = true;
    } catch (e) {
      console.warn('⚠️ [经期助手] 微信云初始化捕获:', e);
    }
  }
}

export interface RequestOptions {
  url: string; // 相对路径，如 '/user/config'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  showErrorToast?: boolean; // 是否在接口失败时主动弹窗提示（默认 false，避免后台静默请求打扰用户）
}

/**
 * 封装的全局请求工具
 */
export function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const token = uni.getStorageSync('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    if (USE_CLOUD_CONTAINER) {
      ensureCloudInited();

      const doCall = (retryCount = 0) => {
        let finalUrl = `${CONTAINER_PATH_PREFIX}${options.url}`;
        let requestData = options.data;

        // 如果是 GET 请求且携带了参数，格式化为 URL Query 参数拼接到 path 中
        const isGet = (options.method || 'GET').toUpperCase() === 'GET';
        if (isGet && options.data && typeof options.data === 'object') {
          const queryPairs: string[] = [];
          Object.keys(options.data).forEach(key => {
            const val = options.data[key];
            if (val !== undefined && val !== null) {
              queryPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
            }
          });
          if (queryPairs.length > 0) {
            finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryPairs.join('&');
          }
          requestData = undefined; // GET 请求参数已编码至 URL，无需传 body
        }

        // 使用微信云托管原生免域名调用
        // @ts-ignore
        if (typeof wx === 'undefined' || !wx.cloud || typeof wx.cloud.callContainer !== 'function') {
          const err = new Error('当前环境不支持 wx.cloud.callContainer');
          console.warn('⚠️ [经期助手] 当前运行环境无微信云托管支持');
          reject(err);
          return;
        }

        // @ts-ignore
        wx.cloud.callContainer({
          config: {
            env: CLOUD_ENV_ID,
          },
          path: finalUrl,
          header: {
            ...headers,
            'X-WX-SERVICE': CONTAINER_SERVICE_NAME,
          },
          method: options.method || 'GET',
          data: requestData,
          timeout: 30000,
          success: (res: any) => {
            // 拦截器逻辑
            handleResponse(res.data, resolve, reject, options.showErrorToast);
          },
          fail: (err: any) => {
            const errCode = err?.errCode || err?.code;
            const rawErrStr = `${err?.errMsg || ''} ${err?.message || ''} ${String(err)}`;
            const errStr = rawErrStr.toLowerCase();
            const isTimeout = 
              errCode === 102002 || 
              errStr.includes('102002') || 
              rawErrStr.includes('请求超时') || 
              errStr.includes('timeout') || 
              errStr.includes('time out');
            const isEndpointErr = errStr.includes('endpoint') || errStr.includes('failed to fetch');

            console.warn(`⚠️ [经期助手] 云容器请求 [${options.url}] 遇阻:`, err?.errMsg || err);

            // 如果遇到冷启动超时（102002/请求超时），此时微信云已在后台拉起容器实例
            // 自动延迟 2.5 秒重试，容器就绪后即可瞬间连通
            if (isTimeout && retryCount < 2) {
              console.log(`⏳ 云容器服务正在冷启动唤醒中，已触发唤醒，准备第 ${retryCount + 1} 次重试...`);
              setTimeout(() => {
                doCall(retryCount + 1);
              }, 2500);
              return;
            }

            // 仅在明确需要 Toast 且不是静默背景请求时提示
            if (options.showErrorToast) {
              uni.showToast({
                title: isTimeout ? '服务正在唤醒中，请稍候' : (isEndpointErr ? '网络连接微阻，已进入离线模式' : '云端请求遇到微阻'),
                icon: 'none',
                duration: 2500,
              });
            }
            reject(err);
          },
        });
      };

      doCall();
    } else {
      // 使用传统服务器 HTTP 访问
      uni.request({
        url: `${BASE_URL}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: headers,
        success: (res) => {
          handleResponse(res.data as ApiResponse<T>, resolve, reject, options.showErrorToast);
        },
        fail: (err) => {
          if (options.showErrorToast) {
            uni.showToast({
              title: '网络连接失败',
              icon: 'none',
            });
          }
          reject(err);
        },
      });
    }
  });
}

/**
 * 拦截响应状态码，处理全局重定向或提示
 */
function handleResponse<T>(
  resData: any,
  resolve: (value: ApiResponse<T>) => void,
  reject: (reason?: any) => void,
  showErrorToast = false,
) {
  const code = resData?.code ?? 200;

  if (code === 200) {
    resolve(resData);
  } else if (code === 401) {
    // 未授权，清除本地 Token 并重定向至登录或重新初始化
    uni.removeStorageSync('auth_token');
    uni.showToast({
      title: '登录已过期，正在重新连接',
      icon: 'none',
    });
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index',
      });
    }, 1500);
    reject(new Error('Unauthorized'));
  } else {
    // 业务错误拦截
    if (showErrorToast) {
      uni.showToast({
        title: resData?.message || '请求处理异常',
        icon: 'none',
        duration: 3000,
      });
    }
    reject(resData);
  }
}
