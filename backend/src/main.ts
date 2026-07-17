import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { GlobalExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局 API 前缀
  app.setGlobalPrefix('api/v1');

  // 全局统一响应格式拦截器：{ code, message, data }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常捕获过滤器：统一格式化错误返回
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局 DTO 参数校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 自动去除未定义字段
      forbidNonWhitelisted: true, // 多余字段直接报 400
      transform: true,           // 请求数据自动转换为 DTO 类实例
    }),
  );

  // CORS：开发时允许管理后台跨域访问
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  });

  const port = process.env.PORT ?? 80;
  await app.listen(port);
  console.log(`🚀 经期助手 API 服务已启动，监听端口: ${port}`);
}
bootstrap();
