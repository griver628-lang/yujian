import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少 Authorization 请求头');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
      // 将解码的 userId 注入到请求上下文中，供 Controller 直接读取
      request.userId = payload.userId;
      return true;
    } catch {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }
}
