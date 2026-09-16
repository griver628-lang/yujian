import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminStatsResponse {
  totalUsers: number;
  todayNewUsers: number;
  newUsers7d: number;
  todayActiveUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  establishedUsers: number;
  dormantUsers: number;
  totalRecords: number;
  todayRecords: number;
  avgPeriodCycle: number;
  avgPeriodDuration: number;
  trend: Array<{
    date: string;
    newUsers: number;
    records: number;
  }>;
}

export interface UserItemResponse {
  userId: string;
  maskedUserId: string;
  isFirstTime: boolean;
  periodCycle: number;
  periodDuration: number;
  visitCount: number;
  recordCount: number;
  createdAt: Date;
  lastActiveAt: Date;
  status: 'new' | 'active' | 'established' | 'dormant';
  statusLabel: string;
  nickname?: string | null;
  avatarUrl?: string | null;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 验证管理员密钥
   */
  verifyKey(key?: string): boolean {
    const validKey = process.env.ADMIN_KEY || 'yujian2026';
    if (!key || key.trim() !== validKey.trim()) {
      throw new UnauthorizedException('管理密钥无效或未提供');
    }
    return true;
  }

  /**
   * 获取全局统计指标（总用户、新用户、老用户、活跃用户、14天趋势）
   */
  async getStats(): Promise<AdminStatsResponse> {
    const now = new Date();

    // 当日 0 点
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 7天前、14天前、30天前
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      todayNewUsers,
      newUsers7d,
      todayActiveUsers,
      activeUsers7d,
      activeUsers30d,
      totalRecords,
      todayRecords,
      avgConfig,
    ] = await Promise.all([
      this.prisma.userConfig.count(),
      this.prisma.userConfig.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.userConfig.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.userConfig.count({ where: { lastActiveAt: { gte: todayStart } } }),
      this.prisma.userConfig.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
      this.prisma.userConfig.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
      this.prisma.dailyRecord.count(),
      this.prisma.dailyRecord.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.userConfig.aggregate({
        _avg: {
          periodCycle: true,
          periodDuration: true,
        },
      }),
    ]);

    // 老用户：注册 > 7天 且不是首次配置
    const establishedUsers = await this.prisma.userConfig.count({
      where: {
        createdAt: { lt: sevenDaysAgo },
        isFirstTime: false,
      },
    });

    // 沉睡用户：最后活跃时间 > 14天前
    const dormantUsers = await this.prisma.userConfig.count({
      where: {
        lastActiveAt: { lt: fourteenDaysAgo },
      },
    });

    // 14 天每日趋势数据
    const trend: Array<{ date: string; newUsers: number; records: number }> = [];
    const trendPromises: Promise<void>[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      trendPromises.push(
        Promise.all([
          this.prisma.userConfig.count({
            where: { createdAt: { gte: d, lt: nextD } },
          }),
          this.prisma.dailyRecord.count({
            where: { createdAt: { gte: d, lt: nextD } },
          }),
        ]).then(([newUsers, records]) => {
          trend.push({ date: dateStr, newUsers, records });
        }),
      );
    }

    await Promise.all(trendPromises);
    // 按日期升序重排
    trend.sort((a, b) => (a.date > b.date ? 1 : -1));

    return {
      totalUsers,
      todayNewUsers,
      newUsers7d,
      todayActiveUsers,
      activeUsers7d,
      activeUsers30d,
      establishedUsers,
      dormantUsers,
      totalRecords,
      todayRecords,
      avgPeriodCycle: Math.round((avgConfig._avg.periodCycle || 28) * 10) / 10,
      avgPeriodDuration: Math.round((avgConfig._avg.periodDuration || 5) * 10) / 10,
      trend,
    };
  }

  /**
   * 分页获取用户列表，支持新用户/活跃用户/老用户/沉睡用户过滤与搜索
   */
  async getUsers(params: {
    page?: number;
    pageSize?: number;
    filter?: 'all' | 'new' | 'active' | 'established' | 'dormant';
    search?: string;
  }): Promise<{
    list: UserItemResponse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const filter = params.filter || 'all';
    const search = params.search?.trim();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 构建 Prisma 查询条件
    const where: any = {};

    if (search) {
      where.userId = { contains: search };
    }

    if (filter === 'new') {
      // 新用户：7天内注册 或 仍处于首次配置状态
      where.OR = [
        { createdAt: { gte: sevenDaysAgo } },
        { isFirstTime: true },
      ];
    } else if (filter === 'active') {
      // 活跃用户：近7天内有活跃
      where.lastActiveAt = { gte: sevenDaysAgo };
    } else if (filter === 'established') {
      // 稳定老用户：注册超7天且已完成配置
      where.createdAt = { lt: sevenDaysAgo };
      where.isFirstTime = false;
    } else if (filter === 'dormant') {
      // 沉睡用户：超过14天未活跃
      where.lastActiveAt = { lt: fourteenDaysAgo };
    }

    const [total, userConfigs] = await Promise.all([
      this.prisma.userConfig.count({ where }),
      this.prisma.userConfig.findMany({
        where,
        orderBy: { lastActiveAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    // 批量统计这批用户的打卡记录条数
    const userIds = userConfigs.map((u) => u.userId);
    const recordCounts = await this.prisma.dailyRecord.groupBy({
      by: ['userId'],
      _count: { recordId: true },
      where: { userId: { in: userIds } },
    });

    const recordCountMap = new Map<string, number>();
    recordCounts.forEach((r) => {
      recordCountMap.set(r.userId, r._count.recordId);
    });

    const list: UserItemResponse[] = userConfigs.map((u) => {
      const isNew = u.createdAt >= sevenDaysAgo || u.isFirstTime;
      const isActive = u.lastActiveAt >= sevenDaysAgo;
      const isDormant = u.lastActiveAt < fourteenDaysAgo;

      let status: 'new' | 'active' | 'established' | 'dormant' = 'established';
      let statusLabel = '🌿 稳定老用户';

      if (isNew) {
        status = 'new';
        statusLabel = '🌟 新用户';
      } else if (isActive) {
        status = 'active';
        statusLabel = '⚡️ 活跃用户';
      } else if (isDormant) {
        status = 'dormant';
        statusLabel = '💤 沉睡用户';
      }

      // 脱敏 openid，如 o4G6Z...f89a
      const maskedUserId =
        u.userId.length > 10
          ? `${u.userId.slice(0, 6)}...${u.userId.slice(-4)}`
          : u.userId;

      return {
        userId: u.userId,
        maskedUserId,
        isFirstTime: u.isFirstTime,
        periodCycle: u.periodCycle,
        periodDuration: u.periodDuration,
        visitCount: u.visitCount ?? 1,
        recordCount: recordCountMap.get(u.userId) || 0,
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt,
        status,
        statusLabel,
        nickname: u.nickname,
        avatarUrl: u.avatarUrl,
      };
    });

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  /**
   * 查看指定用户的周期设置与最近打卡流水
   */
  async getUserRecords(userId: string) {
    const [config, records] = await Promise.all([
      this.prisma.userConfig.findUnique({
        where: { userId },
      }),
      this.prisma.dailyRecord.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      config,
      totalRecords: records.length,
      recentRecords: records,
    };
  }
}
