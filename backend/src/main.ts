import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { GlobalExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局 API 前缀（排除根路径 /、health 探针与 admin 页面及接口，供外部与微信云托管直接访问）
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health', 'admin', 'admin/*path'],
  });

  // 全局统一响应格式拦截器：{ code, message, data }
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 全局异常捕获过滤器：统一格式化错误返回
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 全局 DTO 参数校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 自动去除未定义字段
      forbidNonWhitelisted: false, // 允许自动剥离只读属性（如 createdAt/updatedAt 等），避免抛 400
      transform: true, // 请求数据自动转换为 DTO 类实例
    }),
  );

  // CORS：开发时允许管理后台跨域访问
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  });

  const port = process.env.PORT ?? 80;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 愈见 API 服务已启动，监听端口: ${port} (0.0.0.0)`);
}
bootstrap();
