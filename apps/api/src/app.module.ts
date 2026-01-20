import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { validateEnv } from './config/env.schema';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import {
  AllExceptionsFilter,
  PrismaExceptionFilter,
  PrismaValidationFilter,
} from './common/filters';
import {
  TransformInterceptor,
  LoggingInterceptor,
  TimeoutInterceptor,
} from './common/interceptors';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置模块 - 带环境变量校验
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),

    // 速率限制模块
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 秒
        limit: 10, // 10 次请求
      },
      {
        name: 'medium',
        ttl: 10000, // 10 秒
        limit: 50, // 50 次请求
      },
      {
        name: 'long',
        ttl: 60000, // 1 分钟
        limit: 100, // 100 次请求
      },
    ]),

    // Prisma 数据库模块
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // 全局速率限制守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // 全局异常过滤器（顺序很重要：具体的在前，通用的在后）
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaValidationFilter,
    },

    // 全局拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new TimeoutInterceptor(30000),
    },
  ],
})
export class AppModule {}
