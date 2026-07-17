import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as https from 'https';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 微信小程序登录：用 code 换取 openid，签发自定义 JWT
   */
  async wxLogin(code: string, cloudOpenId?: string) {
    // 云托管环境：微信内网网关自动注入 openid，跳过 API 调用
    // 标准环境：通过 code 换取 openid
    const openid = cloudOpenId || await this.getWxOpenId(code);

    // 2. 在数据库中查找或创建用户配置
    const existingConfig = await this.prisma.userConfig.findUnique({
      where: { userId: openid },
    });

    const isFirstTime = !existingConfig;

    const finalConfig = isFirstTime
      ? await this.prisma.userConfig.create({
          data: {
            userId: openid,
            periodCycle: 28,
            periodDuration: 5,
            isFirstTime: true,
          },
        })
      : existingConfig;

    // 3. 签发自定义 JWT Token（有效期 30 天）
    const token = jwt.sign(
      { userId: openid },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '30d' },
    );

    return {
      token,
      isFirstTime: finalConfig.isFirstTime,
      userConfig: isFirstTime
        ? null
        : {
            periodCycle: finalConfig.periodCycle,
            periodDuration: finalConfig.periodDuration,
          },
    };
  }

  /**
   * 调用微信 jscode2session 接口换取 openid
   * 在微信云托管环境中，openid 可直接从请求 Header 读取，此处提供标准兜底方案
   */
  private getWxOpenId(code: string): Promise<string> {
    // 优先使用云托管内网免鉴权 Header 注入的 openid
    // 此方法在标准 HTTP 环境下降级为调用微信接口
    const appid = process.env.WX_APPID;
    const secret = process.env.WX_SECRET;

    if (!appid || !secret) {
      throw new BadRequestException('服务端微信凭证未配置');
    }

    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const parsed = JSON.parse(data);
          if (parsed.openid) {
            resolve(parsed.openid);
          } else {
            reject(new BadRequestException(`微信 code 无效: ${parsed.errmsg}`));
          }
        });
      }).on('error', reject);
    });
  }
}
