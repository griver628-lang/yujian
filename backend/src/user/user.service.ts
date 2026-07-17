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
      updatedAt: config.updatedAt,
    };
  }

  /** 修改/初始化用户周期设置 */
  async updateConfig(userId: string, dto: UpdateConfigDto) {
    const config = await this.prisma.userConfig.upsert({
      where: { userId },
      create: {
        userId,
        periodCycle: dto.periodCycle,
        periodDuration: dto.periodDuration,
        isFirstTime: false,
      },
      update: {
        periodCycle: dto.periodCycle,
        periodDuration: dto.periodDuration,
        isFirstTime: false,
      },
    });
    return {
      periodCycle: config.periodCycle,
      periodDuration: config.periodDuration,
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
