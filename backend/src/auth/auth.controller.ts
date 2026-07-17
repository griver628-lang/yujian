import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/wx-login
   * 微信云托管环境下优先读取 Header 中注入的 openid（免 API 换取）
   */
  @Post('wx-login')
  async wxLogin(@Body() dto: WxLoginDto, @Req() req: any) {
    const cloudOpenId: string | undefined = req.headers['x-wx-openid'];
    return this.authService.wxLogin(dto.code, cloudOpenId);
  }
}
