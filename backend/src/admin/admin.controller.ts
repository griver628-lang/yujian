import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Headers,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { getAdminHtml } from './admin.template';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 挂载 /admin 页面，浏览器打开即可使用，自适应桌面端与移动端
   */
  @Get()
  serveAdminPage(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(getAdminHtml());
  }

  /**
   * 验证管理员密钥接口: POST /admin/api/verify
   */
  @Post('api/verify')
  verifyKey(
    @Headers('x-admin-key') headerKey?: string,
    @Body('key') bodyKey?: string,
  ) {
    const key = headerKey || bodyKey;
    this.adminService.verifyKey(key);
    return { success: true, message: '管理员身份验证通过' };
  }

  /**
   * 获取全局指标与 14 天趋势统计: GET /admin/api/stats
   */
  @Get('api/stats')
  async getStats(
    @Headers('x-admin-key') headerKey?: string,
    @Query('key') queryKey?: string,
  ) {
    const key = headerKey || queryKey;
    this.adminService.verifyKey(key);
    return this.adminService.getStats();
  }

  /**
   * 获取分类用户列表（支持新用户/活跃用户/老用户/沉睡用户筛选与搜索）: GET /admin/api/users
   */
  @Get('api/users')
  async getUsers(
    @Headers('x-admin-key') headerKey?: string,
    @Query('key') queryKey?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('filter')
    filter?: 'all' | 'new' | 'active' | 'established' | 'dormant',
    @Query('search') search?: string,
  ) {
    const key = headerKey || queryKey;
    this.adminService.verifyKey(key);
    return this.adminService.getUsers({ page, pageSize, filter, search });
  }

  /**
   * 查询指定用户的健康周期配置与最近打卡记录明细: GET /admin/api/users/:userId/records
   */
  @Get('api/users/:userId/records')
  async getUserRecords(
    @Param('userId') userId: string,
    @Headers('x-admin-key') headerKey?: string,
    @Query('key') queryKey?: string,
  ) {
    const key = headerKey || queryKey;
    this.adminService.verifyKey(key);
    return this.adminService.getUserRecords(userId);
  }
}
