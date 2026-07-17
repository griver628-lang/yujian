import { Controller, Get, Put, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** GET /api/v1/user/config */
  @Get('config')
  getConfig(@Req() req: any) {
    return this.userService.getConfig(req.userId);
  }

  /** PUT /api/v1/user/config */
  @Put('config')
  updateConfig(@Req() req: any, @Body() dto: UpdateConfigDto) {
    return this.userService.updateConfig(req.userId, dto);
  }

  /** POST /api/v1/user/reset */
  @Post('reset')
  resetAllData(@Req() req: any) {
    return this.userService.resetAllData(req.userId);
  }
}
