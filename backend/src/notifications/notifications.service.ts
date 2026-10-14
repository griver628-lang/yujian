import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private cachedAccessToken: { token: string; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 用户在前端授权微信服务通知后，上报保存订阅额度
   */
  async recordSubscription(userId: string, templateIds: string[]) {
    const results: any[] = [];
    for (const templateId of templateIds) {
      if (!templateId || typeof templateId !== 'string') continue;
      const sub = await this.prisma.userSubscription.upsert({
        where: {
          userId_templateId: {
            userId,
            templateId,
          },
        },
        create: {
          userId,
          templateId,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });
      results.push(sub);
    }
    this.logger.log(`✅ [服务通知] 用户 ${userId} 成功记录订阅额度: ${templateIds.join(',')}`);
    return { success: true, subscriptions: results };
  }

  /**
   * 获取微信小程序服务端的 AccessToken
   * 微信云托管优先免鉴权调用，其他环境则凭 AppID + AppSecret 换取
   */
  private async getAccessToken(): Promise<string | null> {
    const now = Date.now();
    if (this.cachedAccessToken && this.cachedAccessToken.expiresAt > now + 60000) {
      return this.cachedAccessToken.token;
    }

    const appId = this.configService.get<string>('WX_APPID');
    const appSecret = this.configService.get<string>('WX_APPSECRET');

    if (!appId || !appSecret || appId.includes('your_appid') || appSecret.includes('your_appsecret')) {
      return null;
    }

    try {
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.access_token) {
        this.cachedAccessToken = {
          token: data.access_token,
          expiresAt: now + data.expires_in * 1000,
        };
        return data.access_token;
      }
      this.logger.warn(`获取微信 access_token 失败: ${JSON.stringify(data)}`);
      return null;
    } catch (e) {
      this.logger.error('请求微信 Token 网络异常', e);
      return null;
    }
  }

  /**
   * 调用微信官方 API 下发服务通知到微信聊天列表
   */
  async sendSubscribeMessage(params: {
    userId: string;
    templateId: string;
    page?: string;
    data: Record<string, { value: string }>;
    miniprogramState?: string;
  }): Promise<{ success: boolean; errCode?: number; errMsg?: string }> {
    const { userId, templateId, page = 'pages/index/index', data, miniprogramState } = params;

    // 优先使用前端传入的当前小程序版本状态 (developer/trial/formal)，开发/体验调试时不能传 formal
    const state = miniprogramState || 'developer';

    const payload: any = {
      touser: userId,
      template_id: templateId,
      page,
      data,
      miniprogram_state: state,
      lang: 'zh_CN',
    };

    this.logger.log(`📤 [微信服务通知] 准备下发: touser=${userId}, templateId=${templateId}, state=${state}`);

    // 1. 尝试微信云托管内网免鉴权调用通道 (无需自己维护 token)
    try {
      const cloudRes = await fetch('http://api.weixin.qq.com/cgi-bin/message/subscribe/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const cloudData = await cloudRes.json();
      this.logger.log(`📥 [微信服务通知] 云托管微信接口返回: ${JSON.stringify(cloudData)}`);
      if (cloudData.errcode === 0) {
        this.logger.log(`✅ [微信服务通知-云托管免鉴权] 发送成功给 ${userId}`);
        await this.decrementSubscriptionCount(userId, templateId);
        return { success: true };
      } else {
        // 如果是 43101 (未授权当前版本) 且初始状态为 developer，尝试以 trial (体验版) 重试一次
        if (cloudData.errcode === 43101 && state === 'developer') {
          this.logger.log(`🔄 尝试以 trial(体验版) 状态重试下发...`);
          payload.miniprogram_state = 'trial';
          const retryRes = await fetch('http://api.weixin.qq.com/cgi-bin/message/subscribe/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const retryData = await retryRes.json();
          this.logger.log(`📥 [微信服务通知] 重试返回: ${JSON.stringify(retryData)}`);
          if (retryData.errcode === 0) {
            await this.decrementSubscriptionCount(userId, templateId);
            return { success: true };
          }
        }
        this.logger.warn(`❌ [微信服务通知-云托管免鉴权] 微信返回失败: errcode=${cloudData.errcode}, errmsg=${cloudData.errmsg}`);
        return { success: false, errCode: cloudData.errcode, errMsg: cloudData.errmsg };
      }
    } catch (e: any) {
      this.logger.warn(`微信云托管免鉴权通道请求异常 (可能在本地或非云容器环境):`, e?.message);
    }

    // 2. 通用接口调用 (通过 AccessToken)
    const token = await this.getAccessToken();
    if (!token) {
      this.logger.warn(`未配置微信 AppSecret 且非云托管环境，已记录下发请求给 ${userId}`);
      return { success: false, errCode: 9999, errMsg: '云托管免鉴权通道未连通且未配置微信 AppSecret' };
    }

    try {
      const res = await fetch(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const resData = await res.json();
      this.logger.log(`📥 [微信服务通知] 标准接口返回: ${JSON.stringify(resData)}`);
      if (resData.errcode === 0) {
        this.logger.log(`✅ [微信服务通知-标准网关] 发送成功给 ${userId}`);
        await this.decrementSubscriptionCount(userId, templateId);
        return { success: true };
      }
      return { success: false, errCode: resData.errcode, errMsg: resData.errmsg };
    } catch (err: any) {
      this.logger.error('调用微信发送服务通知接口异常', err);
      return { success: false, errMsg: err.message };
    }
  }

  /**
   * 扣减用户的一次性订阅可用额度
   */
  private async decrementSubscriptionCount(userId: string, templateId: string) {
    try {
      const sub = await this.prisma.userSubscription.findUnique({
        where: { userId_templateId: { userId, templateId } },
      });
      if (sub && sub.count > 0) {
        await this.prisma.userSubscription.update({
          where: { id: sub.id },
          data: { count: sub.count - 1 },
        });
      }
    } catch (e) {}
  }

  /**
   * 规则 1：每天 22:00 (10点) 前未记录则提醒，记录则不提醒
   */
  async checkAndSendDailyRecordReminders(todayStr: string) {
    this.logger.log(`⏰ [服务通知巡检] 开始巡检当日 ${todayStr} 未记录打卡用户...`);

    // 查找所有开启了「服务通知」和「晚10点前未记录关怀」的用户
    const users = await this.prisma.userConfig.findMany({
      where: {
        notificationEnabled: true,
        remindDailyRecord: true,
      },
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      // 检查该用户今天是否有打卡记录
      const hasRecord = await this.prisma.dailyRecord.findUnique({
        where: {
          userId_date: {
            userId: user.userId,
            date: todayStr,
          },
        },
      });

      // 核心业务规则：记录则不提醒！
      if (hasRecord) {
        skippedCount++;
        continue;
      }

      // 未记录则提醒：查询该用户是否订阅过每日打卡模板
      const subscriptions = await this.prisma.userSubscription.findMany({
        where: {
          userId: user.userId,
          count: { gt: 0 },
        },
      });

      if (subscriptions.length > 0) {
        const sub = subscriptions[0];
        await this.sendSubscribeMessage({
          userId: user.userId,
          templateId: sub.templateId,
          // 点击服务通知卡片，直接进入小程序并自动定位到今天的打卡面板
          page: `pages/index/index?from=notification&action=record&date=${todayStr}`,
          data: {
            thing1: { value: '今日健康记录未打卡' },
            time2: { value: `${todayStr} 21:30` },
            thing3: { value: '睡前花10秒记一下体征，让愈见懂你~' },
          },
        });
        sentCount++;
      }
    }

    this.logger.log(`✅ [服务通知巡检完成] 今日已打卡免打扰: ${skippedCount} 人, 发送未打卡提醒: ${sentCount} 人`);
    return { sentCount, skippedCount };
  }

  /**
   * 规则 2 & 3：发送经期开始与排卵期专属微信服务通知
   */
  async sendCareReminders(userId: string, templateId?: string, type: 'period_start' | 'ovulation' = 'period_start', todayStr?: string) {
    const isPeriod = type === 'period_start';
    const date = todayStr || new Date().toISOString().split('T')[0];
    const targetTemplateId = templateId || (isPeriod ? 'pXM5zboE5ZM1wVKMU8y5hqFwVawgbZ3MkR1_RvIX8MI' : 'pR-25321EybQ2aIqaeilBkp8D9zaHsnafnzf_fcz_0M');
    return this.sendSubscribeMessage({
      userId,
      templateId: targetTemplateId,
      // 点击通知直接打开小程序并弹出对应关怀
      page: `pages/index/index?from=notification&action=${isPeriod ? 'period_start' : 'ovulation'}&date=${date}`,
      data: {
        thing1: { value: isPeriod ? '预计今日大姨妈到访关怀' : '进入黄金排卵期/排卵日提醒' },
        time2: { value: `${date}` },
        thing3: { value: isPeriod ? '多喝温水保暖腹部，好好宠爱自己' : '受孕几率较高，保持规律作息好心情' },
      },
    });
  }

  /**
   * 测试向当前用户发送一条模拟服务通知
   */
  async testSend(userId: string, miniprogramState?: string, customTemplateId?: string) {
    const sub = await this.prisma.userSubscription.findFirst({
      where: { userId, count: { gt: 0 } },
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const templateId = customTemplateId || (sub ? sub.templateId : 'YnDZQ5IxfiDyLG5fx6xHFdD4czABRwzIwvyvmgiJ_uo');
    
    // 构造兼容常见模板关键词的多字段数据，避免因字段名不匹配报 47003
    const messageData: Record<string, { value: string }> = {
      thing1: { value: '今日健康打卡关怀' },
      time2: { value: todayStr },
      thing2: { value: '今日健康状态未打卡' },
      time3: { value: todayStr },
      thing3: { value: '睡前抽10秒记录一下' },
      thing4: { value: '晚10点前未打卡提醒' },
      phrase1: { value: '未记录' },
      date2: { value: todayStr },
    };

    const result = await this.sendSubscribeMessage({
      userId,
      templateId,
      // 测试卡片：点击同样可直接进入小程序并展开今日打卡！
      page: `pages/index/index?from=notification&action=record&date=${todayStr}`,
      data: messageData,
      miniprogramState,
    });

    return {
      success: result.success,
      errCode: result.errCode,
      errMsg: result.errMsg,
      message: result.success
        ? '微信服务通知下发成功！请在微信聊天列表中查看'
        : `微信下发返回: [${result.errCode || 'ERROR'}] ${result.errMsg || '下发失败'}`,
    };
  }
}
