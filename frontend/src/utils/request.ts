import type { ApiResponse } from '../types/index';

// 配置：是否使用微信云托管原生调用（免域名免备案通道）
// 若后期转传统云服务，只需将此参数改为 false，并配置 BASE_URL 即可
const USE_CLOUD_CONTAINER = true;
const BASE_URL = 'https://api.periodhelper.com/api/v1'; // 传统 ECS API 地址
const CONTAINER_SERVICE_NAME = 'period-helper-service'; // 云托管服务名称
const CONTAINER_PATH_PREFIX = '/api/v1';                // 云托管服务内的 API 前缀

/**
 * 封装的全局请求工具
 */
export function request<T>(options: {
  url: string; // 相对路径，如 '/user/config'
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}): Promise<ApiResponse<T>> {
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
      // 检查微信云环境是否初始化
      if (!uni.getStorageSync('cloud_initialized')) {
        // @ts-ignore
        wx.cloud.init();
        uni.setStorageSync('cloud_initialized', true);
      }

      // 使用微信云托管原生免域名调用
      // @ts-ignore
      wx.cloud.callContainer({
        config: {
          env: 'prod-xxxxxx', // 微信云托管环境ID (开发阶段填入实际ID)
        },
        path: `${CONTAINER_PATH_PREFIX}${options.url}`,
        header: {
          ...headers,
          'X-WX-SERVICE': CONTAINER_SERVICE_NAME,
        },
        method: options.method || 'GET',
        data: options.data,
        success: (res: any) => {
          // 拦截器逻辑
          handleResponse(res.data, resolve, reject);
        },
        fail: (err: any) => {
          uni.showToast({
            title: '云容器请求失败',
            icon: 'none',
          });
          reject(err);
        },
      });
    } else {
      // 使用传统服务器 HTTP 访问
      uni.request({
        url: `${BASE_URL}${options.url}`,
        method: options.method || 'GET',
        data: options.data,
        header: headers,
        success: (res) => {
          handleResponse(res.data as ApiResponse<T>, resolve, reject);
        },
        fail: (err) => {
          uni.showToast({
            title: '网络连接失败',
            icon: 'none',
          });
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
  reject: (reason?: any) => void
) {
  const code = resData.code || 200;

  if (code === 200) {
    resolve(resData);
  } else if (code === 401) {
    // 未授权，清除本地 Token 并重定向至登录或重新初始化
    uni.removeStorageSync('auth_token');
    uni.showToast({
      title: '登录已过期，请重新打开小程序',
      icon: 'none',
    });
    // 延迟跳转，避免 Toast 闪现
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/index/index',
      });
    }, 1500);
    reject(new Error('Unauthorized'));
  } else {
    // 业务错误拦截
    uni.showToast({
      title: resData.message || '请求处理异常',
      icon: 'none',
      duration: 3000,
    });
    reject(resData);
  }
}
