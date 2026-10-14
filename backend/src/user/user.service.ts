import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /** 获取用户周期设置 */
  async getConfig(userId: string) {
    const config = await this.prisma.userConfig.findUnique({
      where: { userId },
    });
    if (!config) throw new NotFoundException('用户配置不存在');
    return {
      periodCycle: config.periodCycle,
      periodDuration: config.periodDuration,
      musicEnabled: config.musicEnabled,
      soundEffectsEnabled: config.soundEffectsEnabled,
      notificationEnabled: config.notificationEnabled,
      remindDailyRecord: config.remindDailyRecord,
      remindPeriodStart: config.remindPeriodStart,
      remindOvulation: config.remindOvulation,
      updatedAt: config.updatedAt,
    };
  }

  /** 修改/初始化用户周期设置与偏好 */
  async updateConfig(userId: string, dto: UpdateConfigDto) {
    const config = await this.prisma.userConfig.upsert({
      where: { userId },
      create: {
        userId,
        periodCycle: dto.periodCycle,
        periodDuration: dto.periodDuration,
        musicEnabled: dto.musicEnabled ?? true,
        soundEffectsEnabled: dto.soundEffectsEnabled ?? true,
        notificationEnabled: dto.notificationEnabled ?? true,
        remindDailyRecord: dto.remindDailyRecord ?? true,
        remindPeriodStart: dto.remindPeriodStart ?? true,
        remindOvulation: dto.remindOvulation ?? true,
        isFirstTime: false,
      },
      update: {
        periodCycle: dto.periodCycle,
        periodDuration: dto.periodDuration,
        ...(dto.musicEnabled !== undefined ? { musicEnabled: dto.musicEnabled } : {}),
        ...(dto.soundEffectsEnabled !== undefined ? { soundEffectsEnabled: dto.soundEffectsEnabled } : {}),
        ...(dto.notificationEnabled !== undefined ? { notificationEnabled: dto.notificationEnabled } : {}),
        ...(dto.remindDailyRecord !== undefined ? { remindDailyRecord: dto.remindDailyRecord } : {}),
        ...(dto.remindPeriodStart !== undefined ? { remindPeriodStart: dto.remindPeriodStart } : {}),
        ...(dto.remindOvulation !== undefined ? { remindOvulation: dto.remindOvulation } : {}),
        isFirstTime: false,
      },
    });
    return {
      periodCycle: config.periodCycle,
      periodDuration: config.periodDuration,
      musicEnabled: config.musicEnabled,
      soundEffectsEnabled: config.soundEffectsEnabled,
      notificationEnabled: config.notificationEnabled,
      remindDailyRecord: config.remindDailyRecord,
      remindPeriodStart: config.remindPeriodStart,
      remindOvulation: config.remindOvulation,
    };
  }

  /** 重置用户所有数据 (GDPR 合规) */
  async resetAllData(userId: string) {
    await this.prisma.dailyRecord.deleteMany({ where: { userId } });
    await this.prisma.userConfig.update({
      where: { userId },
      data: { periodCycle: 28, periodDuration: 5, isFirstTime: true },
    });
    return { success: true };
  }
}
