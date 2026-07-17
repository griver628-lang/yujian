import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecordsModule } from './records/records.module';
import { PredictionsModule } from './predictions/predictions.module';
import { GlossaryModule } from './glossary/glossary.module';

@Module({
  imports: [
    // 全局配置模块，.env 文件的环境变量在全程可用
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 全局数据库模块
    PrismaModule,
    // 业务功能模块
    AuthModule,
    UserModule,
    RecordsModule,
    PredictionsModule,
    GlossaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
