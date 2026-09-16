import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 全局统一响应体拦截器
 * 将所有控制器的成功返回值包装为统一格式：{ code, message, data }
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    // 如果是管理后台页面请求（非 json api），直接放行
    if (req.url === '/admin' || req.url === '/admin/') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
      })),
    );
  }
}
