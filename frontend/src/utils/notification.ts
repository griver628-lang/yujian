/**
 * 服务通知与生理期关怀提醒引擎
 * 负责：
 * 1. 微信小程序「服务通知」订阅消息授权与向后端上报
 * 2. 每日 22:00 (10点) 前未记录智能提醒（已打卡则免打扰）
 * 3. 经期来潮首日预测与暖心关怀
 * 4. 排卵日、排卵期荷尔蒙关怀
 */
import { ref } from 'vue';
import type { DailyRecord, PredictionData } from '../types/index';
import { request } from './request';
import { getActiveTemplateIds, hasConfiguredTemplateIds } from '../config/wechatTemplates';

export interface NotificationSettings {
  enabled: boolean;             // 服务通知总开关
  remindDailyRecord: boolean;   // 每天 22:00 前未打卡提醒
  remindPeriodStart: boolean;   // 经期来访暖心关怀
  remindOvulation: boolean;     // 排卵期/排卵日健康提醒
  remindHour: number;           // 晚上提醒时间（默认 22 点，即 10 点前）
}

export interface CareNoticeItem {
  id: string;
  type: 'daily-record' | 'period-start' | 'ovulation-day' | 'ovulation-window' | 'general';
  title: string;
  message: string;
  actionText?: string;
  actionType?: 'record' | 'dismiss' | 'glossary';
  level: 'info' | 'warm' | 'important';
  date: string;
}

class NotificationService {
  public settings = ref<NotificationSettings>({
    enabled: true,
    remindDailyRecord: true,
    remindPeriodStart: true,
    remindOvulation: true,
    remindHour: 22,
  });

  // 当前生效的关怀提醒列表
  public activeNotices = ref<CareNoticeItem[]>([]);

  constructor() {
    this.loadSettings();
  }

  /**
   * 加载持久化通知设置
   */
  public loadSettings() {
    try {
      const stored = uni.getStorageSync('notification_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings.value = { ...this.settings.value, ...parsed };
      }
    } catch (e) {
      console.warn('通知设置加载本地缓存提示:', e);
    }
  }

  /**
   * 保存通知设置
   */
  public saveSettings(newSettings: Partial<NotificationSettings>) {
    this.settings.value = { ...this.settings.value, ...newSettings };
    try {
      uni.setStorageSync('notification_settings', JSON.stringify(this.settings.value));
    } catch (e) {}
  }

  /**
   * 调起微信官方订阅消息授权（推送到微信聊天的「服务通知」）
   */
  public requestSubscribeMessage(): Promise<{ success: boolean; errMsg?: string }> {
    return new Promise((resolve) => {
      // 检查是否配置了微信公众平台的真实模板 ID
      if (!hasConfiguredTemplateIds()) {
        uni.showModal({
          title: '微信服务通知设置指南',
          content: '微信服务通知推送到微信聊天需绑定小程序后台的模板ID。\n\n请在前端 src/config/wechatTemplates.ts 填入你在微信公众平台申请的模板ID。\n\n当前系统已为你自动开启小程序内智能关怀提醒！',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#FF5A79',
          success: () => {
            this.saveSettings({ enabled: true });
            resolve({ success: true });
          },
        });
        return;
      }

      // @ts-ignore
      if (typeof wx !== 'undefined' && typeof wx.requestSubscribeMessage === 'function') {
        const tmplIds = getActiveTemplateIds();

        // @ts-ignore
        wx.requestSubscribeMessage({
          tmplIds,
          success: async (res: any) => {
            console.log('✅ [经期助手服务通知] 微信订阅消息授权结果:', res);
            this.saveSettings({ enabled: true });

            // 筛选出用户同意授权的模板 ID
            const acceptedIds: string[] = [];
            for (const id of tmplIds) {
              if (res[id] === 'accept') {
                acceptedIds.push(id);
              }
            }

            // 将授权结果上报至后端，以便后端定时任务发送服务通知
            if (acceptedIds.length > 0) {
              try {
                await request({
                  url: '/notifications/subscribe',
                  method: 'POST',
                  data: { templateIds: acceptedIds },
                });
              } catch (e) {}
            }

            uni.showToast({
              title: acceptedIds.length > 0 ? '服务通知订阅成功' : '已更新通知设置',
              icon: 'success',
            });
            resolve({ success: true });
          },
          fail: (err: any) => {
            console.warn('⚠️ [经期助手服务通知] 微信订阅授权提示:', err);
            this.saveSettings({ enabled: true });
            uni.showToast({
              title: '已开启通知设置',
              icon: 'none',
            });
            resolve({ success: false, errMsg: err.errMsg });
          },
        });
      } else {
        // H5 或普通环境模拟
        this.saveSettings({ enabled: true });
        uni.showToast({
          title: '服务通知已开启',
          icon: 'success',
        });
        resolve({ success: true });
      }
    });
  }

  /**
   * 发起一次测试服务通知（由后端向当前用户的微信发送）
   */
  public async sendTestNotification(): Promise<boolean> {
    // 自动感知当前小程序版本环境 (开发版/体验版/正式版)
    let miniprogramState = 'developer';
    try {
      // @ts-ignore
      if (typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function') {
        // @ts-ignore
        const account = wx.getAccountInfoSync();
        const ver = account?.miniProgram?.envVersion;
        if (ver === 'release') miniprogramState = 'formal';
        else if (ver === 'trial') miniprogramState = 'trial';
        else miniprogramState = 'developer';
      }
    } catch (e) {}

    try {
      const res = await request<{
        success: boolean;
        message: string;
        errCode?: number;
        errMsg?: string;
      }>({
        url: '/notifications/test-send',
        method: 'POST',
        data: { miniprogramState },
      });

      if (res.data?.success) {
        uni.showModal({
          title: '✅ 服务通知已推送到微信',
          content: '微信官方已成功下发服务通知！\n\n请返回【微信聊天消息列表】，查看置顶的「服务通知」消息卡片。点击卡片可秒级直达小程序并展开今日打卡！',
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#FF5A79',
        });
        return true;
      } else {
        const errCode = res.data?.errCode;
        let tip = res.data?.message || '微信下发未成功';

        if (errCode === 43101) {
          tip = '【微信返回 43101：用户未授权或已拒收】\n\n微信规定下发必须有用户授权额度。请先点击上方的「授权微信订阅消息」并在微信官方弹窗中勾选允许。';
        } else if (errCode === 47003) {
          tip = `【微信返回 47003：模板关键词字段不匹配】\n\n微信反馈模板字段不符，请核对公众平台模板的关键词定义。\n详细: ${res.data?.errMsg || ''}`;
        } else if (errCode === 40037) {
          tip = '【微信返回 40037：模板ID不合法】\n\n请确认该模板 ID 是否属于当前小程序绑定的账号。';
        }

        uni.showModal({
          title: '微信推送反馈',
          content: tip,
          showCancel: false,
          confirmText: '确定',
        });
        return false;
      }
    } catch (e: any) {
      const errMsg = e?.errMsg || e?.message || String(e || '');
      // 检测云端是否尚未部署新版本（404 路由不存在）
      if (errMsg.includes('Cannot POST') || errMsg.includes('404')) {
        uni.showModal({
          title: '云端版本同步提示',
          content: '云端 Docker 镜像正在构建中（或新版本正在切换 100% 流量，通常耗时 3~5 分钟）。\n\n请在微信云托管「版本管理」中查看构建进度，确认新版本构建完毕并将流量设为 100% 即可。\n\n是否先在小程序内体验测试通知直达？',
          confirmText: '模拟直达',
          cancelText: '稍后重试',
          success: (res) => {
            if (res.confirm) {
              const today = new Date().toISOString().split('T')[0];
              uni.reLaunch({
                url: `/pages/index/index?from=notification&action=record&date=${today}`,
              });
            }
          },
        });
        return false;
      }

      uni.showToast({
        title: e?.message || '发送失败，请先授权订阅',
        icon: 'none',
      });
      return false;
    }
  }

  /**
   * 计算并生成当前专属的生理期关怀提醒列表
   * 严格遵循规则：
   * 1. 打开服务通知时，当天 10点 (22:00) 前未进行记录则提醒，记录则不提醒
   * 2. 经期开始进行提醒并关心
   * 3. 排卵期与排卵日关照提醒
   */
  public evaluateCareReminders(
    todayStr: string,
    records: DailyRecord[],
    prediction: PredictionData | null,
  ): CareNoticeItem[] {
    const list: CareNoticeItem[] = [];
    if (!this.settings.value.enabled) {
      this.activeNotices.value = [];
      return [];
    }

    const currentHour = new Date().getHours();
    const hasTodayRecord = records.some((r) => r.date === todayStr);

    // 规则 1：当天 10点 (22:00) 前未记录则提醒，已记录则不提醒
    if (this.settings.value.remindDailyRecord) {
      if (!hasTodayRecord) {
        list.push({
          id: `notice-record-${todayStr}`,
          type: 'daily-record',
          title: '🌙 今日身体打卡关怀',
          message: currentHour >= 20
            ? '已接近晚间 10 点，今天还没记录身体状态哦~ 睡前花 10 秒记一下经期与体征，愈见为你精准护航。'
            : '今天还没记录身体感觉哦，抽出 10 秒打卡体温或心情，让健康数据更有迹可循~',
          actionText: '去记录今日',
          actionType: 'record',
          level: 'warm',
          date: todayStr,
        });
      }
    }

    // 规则 2：经期开始进行提醒并关心
    if (this.settings.value.remindPeriodStart) {
      const todayRecord = records.find((r) => r.date === todayStr);
      const isPeriodStartedToday = todayRecord && todayRecord.menstrualStatus === 'start';
      const isPredictedPeriodToday = prediction?.nextPeriod?.startDate === todayStr;

      if (isPeriodStartedToday) {
        list.push({
          id: `notice-period-start-${todayStr}`,
          type: 'period-start',
          title: '🩸 大姨妈第一天 · 暖心陪伴',
          message: '生理期第一天身体较脆弱容易怕冷，记得多饮温水、避免生冷辛辣。小腹若隐痛可热敷，今晚早点休息哦~',
          actionText: '查看经期指南',
          actionType: 'glossary',
          level: 'important',
          date: todayStr,
        });
      } else if (isPredictedPeriodToday && !hasTodayRecord) {
        list.push({
          id: `notice-period-predict-${todayStr}`,
          type: 'period-start',
          title: '🩸 预测经期来访关怀',
          message: '根据生理周期规律，大姨妈预计于今日到访，随身备好安心裤与温热保温杯，随时从容应对。',
          actionText: '记录姨妈来了',
          actionType: 'record',
          level: 'important',
          date: todayStr,
        });
      }
    }

    // 规则 3：排卵期 / 排卵日关照提醒
    if (this.settings.value.remindOvulation && prediction) {
      if (prediction.ovulationDay === todayStr) {
        list.push({
          id: `notice-ovulation-day-${todayStr}`,
          type: 'ovulation-day',
          title: '🥚 预测【排卵日】健康提醒',
          message: '今天是周期的黄金排卵日，受孕概率达到高峰！备孕姐妹抓住最佳好孕时机，避孕请严密防范~',
          actionText: '查看排卵科普',
          actionType: 'glossary',
          level: 'info',
          date: todayStr,
        });
      } else if (
        prediction.ovulationWindow &&
        todayStr >= prediction.ovulationWindow.startDate &&
        todayStr <= prediction.ovulationWindow.endDate
      ) {
        list.push({
          id: `notice-ovulation-window-${todayStr}`,
          type: 'ovulation-window',
          title: '🌸 正值【排卵期】关怀',
          message: '当前处于排卵期，体内雌激素上升，精力充沛、容光焕发！部分女生可能有轻微拉丝白带，属健康正常现象。',
          actionText: '了解排卵期',
          actionType: 'glossary',
          level: 'info',
          date: todayStr,
        });
      }
    }

    this.activeNotices.value = list;
    return list;
  }
}

export const notificationService = new NotificationService();
