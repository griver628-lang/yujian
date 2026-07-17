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
    return new Promise<boolean>((resolve, reject) => {
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
            } else {
              userConfig.value.isFirstTime = res.data.isFirstTime;
            }

            resolve(res.data.isFirstTime);
          } catch (err) {
            reject(err);
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '微信登录授权失败',
            icon: 'none',
          });
          reject(err);
        },
      });
    });
  };

  /**
   * 加载用户基础设置
   */
  const fetchConfig = async () => {
    try {
      const res = await request<UserConfig>({
        url: '/user/config',
        method: 'GET',
      });
      userConfig.value = {
        ...res.data,
        isFirstTime: false,
      };
    } catch (err) {
      console.error('加载用户设置失败', err);
    }
  };

  /**
   * 保存/修改用户设置
   */
  const saveConfig = async (cycle: number, duration: number) => {
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
      return false;
    }
  };

  /**
   * 按月加载历史记录
   */
  const fetchMonthlyRecords = async (year: string, month: string) => {
    try {
      const res = await request<DailyRecord[]>({
        url: '/records/monthly',
        method: 'GET',
        data: { year, month },
      });
      monthlyRecords.value = res.data;
      return res.data;
    } catch (err) {
      return [];
    }
  };

  /**
   * 保存单日生理记录
   */
  const saveDailyRecord = async (record: DailyRecord) => {
    try {
      await request<void>({
        url: '/records',
        method: 'POST',
        data: record,
      });
      
      // 更新本地缓存
      const index = monthlyRecords.value.findIndex(item => item.date === record.date);
      if (index > -1) {
        monthlyRecords.value[index] = record;
      } else {
        monthlyRecords.value.push(record);
      }

      uni.showToast({
        title: '记录已保存',
        icon: 'success',
      });
      return true;
    } catch (err) {
      return false;
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
