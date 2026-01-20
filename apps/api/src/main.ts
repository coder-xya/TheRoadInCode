import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { EnvConfig } from './config/env.schema';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService<EnvConfig>);
  const port = configService.get('PORT', 4000);
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  // 安全中间件
  app.use(helmet());

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS 配置 - 支持多个 origin
  const origins = corsOrigin
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（same-origin 或 server-to-server）
      if (!origin) return callback(null, true);
      // 开发环境允许所有
      if (nodeEnv === 'development') return callback(null, true);
      // 生产环境检查白名单
      return callback(null, origins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Swagger API 文档（仅开发环境）
  if (nodeEnv === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TheRoadInCode API')
      .setDescription('现代化个人博客系统 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('posts', '文章管理')
      .addTag('categories', '分类管理')
      .addTag('tags', '标签管理')
      .addTag('works', '作品管理')
      .addTag('auth', '认证')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
  }

  // 启用优雅关闭
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`API server running on http://localhost:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap();
