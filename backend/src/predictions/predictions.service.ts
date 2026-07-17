import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class PredictionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  /** 获取下次经期和排卵期预测 */
  async getPredictions(userId: string) {
    const config = await this.userService.getConfig(userId);

    // 获取所有月经开始日期
    const startRecords = await this.prisma.dailyRecord.findMany({
      where: { userId, menstrualStatus: 'start' },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    const startDates = startRecords.map((r) => r.date);
    const recentStart = startDates[startDates.length - 1];
    const avgCycle = this.calcAverageCycle(startDates, config.periodCycle);
    const isIrregular = this.checkIrregular(startDates);

    const baseDate = recentStart || new Date().toISOString().split('T')[0];
    return this.buildPrediction(baseDate, avgCycle, config.periodDuration, isIrregular);
  }

  /** 加权移动平均，自动剔除 >60 天的异常间隔 */
  private calcAverageCycle(startDates: string[], fallback: number): number {
    if (startDates.length < 2) return fallback;
    const intervals: number[] = [];
    for (let i = 1; i < startDates.length; i++) {
      const diff = this.dateDiff(startDates[i - 1], startDates[i]);
      if (diff > 0 && diff <= 60) intervals.push(diff);
    }
    if (intervals.length === 0) return fallback;
    const recent = intervals.slice(-6);
    const weights = recent.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = recent.reduce((s, v, i) => s + v * weights[i], 0);
    return Math.round(weightedSum / totalWeight);
  }

  /** 判断不规则周期：标准差 > 3 天 */
  private checkIrregular(startDates: string[]): boolean {
    if (startDates.length < 3) return false;
    const intervals: number[] = [];
    for (let i = 1; i < startDates.length; i++) {
      const d = this.dateDiff(startDates[i - 1], startDates[i]);
      if (d > 0 && d <= 60) intervals.push(d);
    }
    if (intervals.length < 2) return false;
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / intervals.length;
    return Math.sqrt(variance) > 3;
  }

  /** 构建完整预测结果 */
  private buildPrediction(
    recentStart: string,
    avgCycle: number,
    duration: number,
    isIrregular: boolean,
  ) {
    const nextStart = this.addDays(recentStart, avgCycle);
    const nextEnd = this.addDays(nextStart, duration - 1);
    const ovulationDay = this.addDays(nextStart, -14);
    const result: any = {
      nextPeriod: { startDate: nextStart, endDate: nextEnd },
      ovulationDay,
      ovulationWindow: {
        startDate: this.addDays(ovulationDay, -5),
        endDate: this.addDays(ovulationDay, 1),
      },
      isIrregular,
    };
    if (isIrregular) {
      result.nextPeriod.range = {
        startMin: this.addDays(nextStart, -3),
        startMax: this.addDays(nextStart, 3),
      };
    }
    return result;
  }

  private dateDiff(a: string, b: string): number {
    return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
}
