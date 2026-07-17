import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

/**
 * 全局 HTTP 异常过滤器
 * 捕获所有未处理的异常，统一输出 { code, message, data: null } 格式错误响应
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalException');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        const resObj = res as any;
        // ValidationPipe 返回的错误信息是数组
        message = Array.isArray(resObj.message)
          ? resObj.message.join(' | ')
          : resObj.message || message;
      }
    } else {
      this.logger.error(
        `未知异常 [${request.method} ${request.url}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      code: status,
      message,
      data: null,
    });
  }
}
