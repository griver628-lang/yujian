import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * POST /api/v1/notifications/subscribe
   * 前端授权微信订阅消息后上报模板 ID
   */
  @Post('subscribe')
  async subscribe(@Req() req: any, @Body() body: { templateIds: string[] }) {
    return this.notificationsService.recordSubscription(req.userId, body.templateIds || []);
  }

  /**
   * POST /api/v1/notifications/test-send
   * 用户在设置页一键测试发送一条微信服务通知
   */
  @Post('test-send')
  async testSend(@Req() req: any, @Body() body: { miniprogramState?: string; templateId?: string }) {
    // 微信云托管在 callContainer 时会在 headers 自动注入 x-wx-openid 和 x-wx-cloudbase-access-token
    const targetUserId = req.headers['x-wx-openid'] || req.userId;
    const cloudToken = req.headers['x-wx-cloudbase-access-token'] || req.headers['x-wx-token'];
    return this.notificationsService.testSend(targetUserId, body?.miniprogramState, body?.templateId, cloudToken);
  }

  /**
   * POST /api/v1/notifications/trigger-daily-check
   * 定时巡检接口（供 Cron / 云函数 / 管理员调用）
   */
  @Post('trigger-daily-check')
  async triggerDailyCheck(@Body() body: { date?: string }) {
    const targetDate = body?.date || new Date().toISOString().split('T')[0];
    return this.notificationsService.checkAndSendDailyRecordReminders(targetDate);
  }
}
