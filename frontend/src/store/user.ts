import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserConfig, DailyRecord } from '../types/index';
import { request } from '../utils/request';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(uni.getStorageSync('auth_token') || '');
  const userConfig = ref<UserConfig>({
    periodCycle: 28,
    periodDuration: 5,
    isFirstTime: true,
  });
  
  // 缓存当月记录
  const monthlyRecords = ref<DailyRecord[]>([]);

  /**
   * 静默登录换取登录态
   */
  const wxLogin = () => {
    return new Promise<boolean>((resolve) => {
      // 检查本地是否有已存配置，决定降级时是否进入引导页
      const localConfig = uni.getStorageSync('user_config');
      const isConfigured = !!localConfig;

      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          try {
            const res = await request<{
              token: string;
              isFirstTime: boolean;
              userConfig?: UserConfig;
            }>({
              url: '/auth/wx-login',
              method: 'POST',
              data: { code: loginRes.code },
            });

            token.value = res.data.token;
            uni.setStorageSync('auth_token', res.data.token);

            if (res.data.userConfig) {
              userConfig.value = {
                ...res.data.userConfig,
                isFirstTime: res.data.isFirstTime,
              };
              try {
                uni.setStorageSync('user_config', JSON.stringify(userConfig.value));
              } catch (e) {}
            } else {
              userConfig.value.isFirstTime = res.data.isFirstTime;
            }

            console.log('✅ [经期助手] 微信静默登录成功，首次状态:', res.data.isFirstTime);
            resolve(res.data.isFirstTime);
          } catch (err) {
            console.warn('⚠️ [经期助手] 云端登录暂未响应，已自动平滑启用本地模式:', err);
            // 降级策略：如果本地已有设置，不强制跳转引导页，而是进入主页
            resolve(!isConfigured);
          }
        },
        fail: (err) => {
          console.warn('⚠️ [经期助手] 微信登录授权遇到问题，自动启用本地模式:', err);
          resolve(!isConfigured);
        },
      });
    });
  };

  /**
   * 加载用户基础设置
   */
  const fetchConfig = async () => {
    // 优先读取本地持久化设置
    try {
      const local = uni.getStorageSync('user_config');
      if (local) {
        userConfig.value = JSON.parse(local);
      }
    } catch (e) {}

    try {
      const res = await request<UserConfig>({
        url: '/user/config',
        method: 'GET',
      });
      userConfig.value = {
        ...res.data,
        isFirstTime: false,
      };
      try {
        uni.setStorageSync('user_config', JSON.stringify(userConfig.value));
      } catch (e) {}
    } catch (err) {
      console.warn('加载云端用户设置暂时等待中，已加载本地设置');
    }
  };

  /**
   * 保存/修改用户设置
   */
  const saveConfig = async (cycle: number, duration: number) => {
    // 1. 本地状态立即持久化生效
    userConfig.value = {
      ...userConfig.value,
      periodCycle: cycle,
      periodDuration: duration,
      isFirstTime: false,
    };
    try {
      uni.setStorageSync('user_config', JSON.stringify(userConfig.value));
    } catch (e) {}

    try {
      const res = await request<UserConfig>({
        url: '/user/config',
        method: 'PUT',
        data: {
          periodCycle: cycle,
          periodDuration: duration,
        },
      });
      userConfig.value = {
        ...res.data,
        isFirstTime: false,
      };
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      });
      return true;
    } catch (err) {
      console.warn('⚠️ [经期助手] 云端保存配置暂未响应，已安全保存至本地配置:', err);
      uni.showToast({
        title: '已保存至本地',
        icon: 'success',
      });
      return true;
    }
  };

  /**
   * 按月加载历史记录
   */
  const fetchMonthlyRecords = async (year: string, month: string) => {
    // 优先加载本地缓存
    try {
      const cached = uni.getStorageSync('cached_monthly_records');
      if (cached) {
        monthlyRecords.value = JSON.parse(cached);
      }
    } catch (e) {}

    try {
      const res = await request<DailyRecord[]>({
        url: '/records/monthly',
        method: 'GET',
        data: { year, month },
      });
      if (Array.isArray(res.data)) {
        monthlyRecords.value = res.data;
        try {
          uni.setStorageSync('cached_monthly_records', JSON.stringify(res.data));
        } catch (e) {}
      }
      return monthlyRecords.value;
    } catch (err) {
      return monthlyRecords.value;
    }
  };

  /**
   * 保存单日生理记录
   */
  const saveDailyRecord = async (record: DailyRecord) => {
    // 1. 优先清洗数据，仅保留符合后端 DTO 规范的字段，剔除多余元数据 (recordId, userId, createdAt 等)
    const cleanPayload: any = {
      date: record.date,
      menstrualStatus: record.menstrualStatus || 'none',
    };

    if (record.flow && record.flow !== 'none') cleanPayload.flow = record.flow;
    if (record.pain && record.pain !== 'none') cleanPayload.pain = record.pain;
    if (record.color && record.color !== 'none') cleanPayload.color = record.color;
    if (record.discharge && record.discharge !== 'none') cleanPayload.discharge = record.discharge;
    
    if (record.symptoms) {
      cleanPayload.symptoms = {
        head: Array.isArray(record.symptoms.head) ? record.symptoms.head : [],
        breast: Array.isArray(record.symptoms.breast) ? record.symptoms.breast : [],
        body: Array.isArray(record.symptoms.body) ? record.symptoms.body : [],
      };
    }

    if (record.basalTemperature !== undefined && record.basalTemperature !== null && String(record.basalTemperature).trim() !== '') {
      const bbt = parseFloat(String(record.basalTemperature));
      if (!isNaN(bbt) && bbt >= 35.0 && bbt <= 42.0) {
        cleanPayload.basalTemperature = bbt;
      }
    }

    if (record.weight !== undefined && record.weight !== null && String(record.weight).trim() !== '') {
      const w = parseFloat(String(record.weight));
      if (!isNaN(w) && w >= 10 && w <= 300) {
        cleanPayload.weight = w;
      }
    }

    if (record.emotion) {
      cleanPayload.emotion = record.emotion;
    }

    // 2. 无论网络与云端状态如何，立即更新本地内存与 Storage 缓存，保证用户输入的数据永不丢失
    const updateLocalState = () => {
      const index = monthlyRecords.value.findIndex(item => item.date === record.date);
      if (index > -1) {
        monthlyRecords.value[index] = { ...record, ...cleanPayload };
      } else {
        monthlyRecords.value.push({ ...record, ...cleanPayload });
      }
      try {
        uni.setStorageSync('cached_monthly_records', JSON.stringify(monthlyRecords.value));
      } catch (e) {}
    };

    updateLocalState();

    try {
      console.log('📤 [经期助手] 正在提交今日健康记录:', cleanPayload);
      await request<void>({
        url: '/records',
        method: 'POST',
        data: cleanPayload,
      });
      
      console.log('✅ [经期助手] 今日生理记录云端保存成功');
      uni.showToast({
        title: '记录已保存',
        icon: 'success',
      });
      return true;
    } catch (err) {
      console.warn('⚠️ [经期助手] 云端保存暂时遇阻或超时，已安全保存到本地离线数据中:', err);
      uni.showToast({
        title: '已保存至本地',
        icon: 'success',
      });
      return true; // 本地已保存成功，返回 true 允许日历立即更新高亮标记
    }
  };

  /**
   * 注销账号及全部数据 (GDPR)
   */
  const resetAllData = async () => {
    try {
      await request<void>({
        url: '/user/reset',
        method: 'POST',
      });
      token.value = '';
      uni.removeStorageSync('auth_token');
      userConfig.value = {
        periodCycle: 28,
        periodDuration: 5,
        isFirstTime: true,
      };
      monthlyRecords.value = [];
      uni.showToast({
        title: '数据已全部重置',
        icon: 'success',
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    token,
    userConfig,
    monthlyRecords,
    wxLogin,
    fetchConfig,
    saveConfig,
    fetchMonthlyRecords,
    saveDailyRecord,
    resetAllData,
  };
});
