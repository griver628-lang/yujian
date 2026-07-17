import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveRecordDto } from './dto/save-record.dto';
import { MonthlyQueryDto } from './dto/monthly-query.dto';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  /** 按月获取记录列表 */
  async getMonthlyRecords(userId: string, query: MonthlyQueryDto) {
    const month = query.month.padStart(2, '0');
    const prefix = `${query.year}-${month}`;
    return this.prisma.dailyRecord.findMany({
      where: {
        userId,
        date: { startsWith: prefix },
      },
      orderBy: { date: 'asc' },
    });
  }

  /** 保存或更新单日生理记录（含闭环校验） */
  async saveRecord(userId: string, dto: SaveRecordDto) {
    // 闭环状态机校验
    if (dto.menstrualStatus === 'start' || dto.menstrualStatus === 'end') {
      await this.validateMenstrualStateMachine(userId, dto.date, dto.menstrualStatus);
    }

    const recordId = `${dto.date}_${userId}`;

    return this.prisma.dailyRecord.upsert({
      where: { recordId },
      create: {
        recordId,
        userId,
        date: dto.date,
        menstrualStatus: dto.menstrualStatus || 'none',
        flow: dto.flow,
        pain: dto.pain,
        color: dto.color,
        discharge: dto.discharge,
        symptoms: dto.symptoms as any,
        basalTemperature: dto.basalTemperature,
        weight: dto.weight,
        emotion: dto.emotion,
      },
      update: {
        menstrualStatus: dto.menstrualStatus,
        flow: dto.flow,
        pain: dto.pain,
        color: dto.color,
        discharge: dto.discharge,
        symptoms: dto.symptoms as any,
        basalTemperature: dto.basalTemperature,
        weight: dto.weight,
        emotion: dto.emotion,
      },
    });
  }

  /** 离线增量批量同步（客户端最新时间戳优先） */
  async syncRecords(userId: string, records: Partial<SaveRecordDto>[]) {
    const syncedDates: string[] = [];
    for (const record of records) {
      if (!record.date) continue;
      try {
        await this.saveRecord(userId, record as SaveRecordDto);
        syncedDates.push(record.date);
      } catch {
        // 单条记录同步失败不影响其他记录
      }
    }
    return { syncedDates };
  }

  /** 经期闭环状态机校验 */
  private async validateMenstrualStateMachine(
    userId: string,
    date: string,
    action: string,
  ) {
    // 查找该日期之前最近一条有月经状态标记的记录
    const lastRecord = await this.prisma.dailyRecord.findFirst({
      where: {
        userId,
        date: { lt: date },
        menstrualStatus: { not: 'none' },
      },
      orderBy: { date: 'desc' },
    });

    const lastStatus = lastRecord?.menstrualStatus || 'none';

    // 当前处于经期中，不能重复标记开始
    if (action === 'start' && lastStatus === 'start') {
      throw new BadRequestException(
        '状态机异常：上一次月经尚未结束，请先标记走喽。',
      );
    }

    // 不处于经期中，不能标记结束
    if (action === 'end' && lastStatus !== 'start') {
      throw new BadRequestException(
        '状态机异常：当前未处于经期中，无法标记月经结束。',
      );
    }
  }
}
