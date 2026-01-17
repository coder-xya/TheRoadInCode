# NestJS 详解

> 面向初级开发者的 NestJS 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [docs.nestjs.com](https://docs.nestjs.com/) |
| 中文文档 | [docs.nestjs.cn](https://docs.nestjs.cn/) |
| CLI 文档 | [docs.nestjs.com/cli/overview](https://docs.nestjs.com/cli/overview) |
| 技术规范 | [docs.nestjs.com/recipes](https://docs.nestjs.com/recipes) |
| GitHub | [github.com/nestjs/nest](https://github.com/nestjs/nest) |
| 示例项目 | [github.com/nestjs/nest/tree/master/sample](https://github.com/nestjs/nest/tree/master/sample) |

## 1. NestJS 是什么

### 一句话解释
NestJS 是一个基于 TypeScript 的**后端框架**，用模块化和依赖注入让 Node.js 项目结构清晰、易维护。

### 与 Express 的区别

| 特性 | Express | NestJS |
|------|---------|--------|
| 结构 | 自由（容易混乱） | 模块化（有规范） |
| TypeScript | 需要配置 | 原生支持 |
| 依赖注入 | 无 | 内置 |
| 代码组织 | 自己决定 | 约定俗成 |
| 学习曲线 | 低 | 中等 |
| 适合项目 | 小型/原型 | 中大型 |

### 类比理解
- **Express**：毛坯房，什么都要自己装修
- **NestJS**：精装修公寓，拎包入住，有物业管理

---

## 2. 核心概念（20% 核心知识）

### 2.1 四大核心组件

```
┌─────────────────────────────────────────────────────┐
│                     Module                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Controller  │  │   Service   │  │  Provider   │ │
│  │  (接待员)   │  │  (业务员)   │  │  (工具人)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

| 组件 | 职责 | 类比 |
|------|------|------|
| **Module** | 组织代码的容器 | 部门 |
| **Controller** | 处理 HTTP 请求 | 前台接待 |
| **Service** | 业务逻辑 | 业务员 |
| **Provider** | 可注入的服务 | 工具/资源 |

### 2.2 请求处理流程

```
HTTP 请求
    ↓
Guard（守卫）→ 权限检查
    ↓
Interceptor（拦截器）→ 前置处理
    ↓
Pipe（管道）→ 数据验证/转换
    ↓
Controller → 路由到具体方法
    ↓
Service → 处理业务逻辑
    ↓
Interceptor → 后置处理
    ↓
HTTP 响应
```

---

## 3. 装饰器详解

### 3.1 什么是装饰器

装饰器是**给类/方法打标签**，告诉 NestJS 这个东西是什么、怎么用。

```typescript
@Controller('users')  // 标签：这是一个控制器，路由前缀是 /users
export class UsersController {

  @Get(':id')  // 标签：这个方法处理 GET /users/:id
  getUser(@Param('id') id: string) {  // 标签：从路径获取 id 参数
    return { id };
  }
}
```

### 3.2 常用装饰器速查

#### 模块装饰器

```typescript
@Module({
  imports: [OtherModule],      // 导入其他模块
  controllers: [UsersController],  // 注册控制器
  providers: [UsersService],   // 注册服务
  exports: [UsersService],     // 导出给其他模块用
})
export class UsersModule {}
```

#### 控制器装饰器

```typescript
@Controller('users')  // 路由前缀
export class UsersController {

  @Get()              // GET /users
  findAll() {}

  @Get(':id')         // GET /users/123
  findOne(@Param('id') id: string) {}

  @Post()             // POST /users
  create(@Body() dto: CreateUserDto) {}

  @Put(':id')         // PUT /users/123
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {}

  @Delete(':id')      // DELETE /users/123
  remove(@Param('id') id: string) {}
}
```

#### 参数装饰器

```typescript
@Get('search')
search(
  @Query('keyword') keyword: string,     // ?keyword=xxx
  @Query('page') page: number,           // ?page=1
  @Headers('authorization') token: string, // 请求头
  @Req() request: Request,               // 原始请求对象
  @Res() response: Response,             // 原始响应对象
) {}

@Post()
create(
  @Body() dto: CreateUserDto,            // 整个请求体
  @Body('email') email: string,          // 请求体的某个字段
) {}
```

#### 服务装饰器

```typescript
@Injectable()  // 标记为可注入的服务
export class UsersService {
  // ...
}
```

---

## 4. 依赖注入

### 4.1 什么是依赖注入

**不用依赖注入**：
```typescript
class UsersController {
  private usersService: UsersService;

  constructor() {
    // 自己创建依赖，紧耦合
    this.usersService = new UsersService(new DatabaseService());
  }
}
```

**使用依赖注入**：
```typescript
@Controller('users')
class UsersController {
  // NestJS 自动创建并注入
  constructor(private readonly usersService: UsersService) {}
}
```

### 4.2 依赖注入的好处

1. **松耦合**：不需要知道依赖怎么创建
2. **易测试**：可以注入 Mock 对象
3. **单例管理**：整个应用共享一个实例

### 4.3 使用方式

```typescript
// 1. 创建 Service
@Injectable()
export class UsersService {
  findAll() {
    return [{ id: 1, name: '张三' }];
  }
}

// 2. 在 Module 中注册
@Module({
  providers: [UsersService],  // 注册
  exports: [UsersService],    // 导出（可选）
})
export class UsersModule {}

// 3. 在 Controller 中注入使用
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
```

---

## 5. 项目配置文件详解

### 5.1 main.ts（入口文件）

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // 创建 NestJS 应用实例
  const app = await NestFactory.create(AppModule);

  // 设置全局路由前缀
  // 所有路由变成 /api/v1/xxx
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 自动去除 DTO 中未定义的字段
      transform: true,           // 自动类型转换（string → number）
      forbidNonWhitelisted: true, // 遇到未定义字段直接报错
    }),
  );

  // 启用 CORS（跨域资源共享）
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,  // 允许携带 cookie
  });

  // 启动服务器
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API server running on http://localhost:${port}`);
}

bootstrap();
```

### 5.2 app.module.ts（根模块）

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置模块：加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,  // 全局可用，不需要每个模块都导入
      envFilePath: ['.env.local', '.env'],  // 按顺序查找
    }),
  ],
  controllers: [AppController],  // 注册控制器
  providers: [AppService],       // 注册服务
})
export class AppModule {}
```

### 5.3 nest-cli.json（CLI 配置）

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  // JSON Schema，提供自动补全

  "collection": "@nestjs/schematics",
  // 使用 NestJS 官方代码生成器

  "sourceRoot": "src",
  // 源代码根目录

  "compilerOptions": {
    "deleteOutDir": true
    // 编译前清空输出目录
  }
}
```

---

## 6. 常用场景示例

### 6.1 完整的 CRUD 示例

```typescript
// users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

```typescript
// users.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '@repo/database';

@Injectable()
export class UsersService {
  async create(dto: CreateUserDto) {
    return db.user.create({ data: dto });
  }

  async findAll({ page, limit }) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      db.user.findMany({ skip, take: limit }),
      db.user.count(),
    ]);
    return { data, meta: { total, page, limit } };
  }

  async findOne(id: string) {
    return db.user.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateUserDto) {
    return db.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return db.user.delete({ where: { id } });
  }
}
```

### 6.2 DTO 验证

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(2, { message: '用户名至少 2 个字符' })
  username: string;

  @IsString()
  @MinLength(6, { message: '密码至少 6 个字符' })
  password: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

### 6.3 异常处理

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne(id: string) {
    const user = await db.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const exists = await db.user.findUnique({
      where: { email: dto.email }
    });

    if (exists) {
      throw new BadRequestException('邮箱已被注册');
    }

    return db.user.create({ data: dto });
  }
}
```

### 6.4 常用异常类

| 异常类 | HTTP 状态码 | 使用场景 |
|--------|-------------|----------|
| `BadRequestException` | 400 | 参数错误 |
| `UnauthorizedException` | 401 | 未登录 |
| `ForbiddenException` | 403 | 无权限 |
| `NotFoundException` | 404 | 资源不存在 |
| `ConflictException` | 409 | 资源冲突 |
| `InternalServerErrorException` | 500 | 服务器错误 |

### 6.5 Prisma（基于 Monorepo 共享包）

本项目把 Prisma Client 放在 `packages/database`，后端通过工作区依赖直接复用。

```typescript
import { Module } from '@nestjs/common';
import { db } from '@repo/database';

export const DB = Symbol('DB');

@Module({
  providers: [{ provide: DB, useValue: db }],
  exports: [DB],
})
export class DatabaseModule {}
```

业务服务里注入使用：

```typescript
import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@repo/database';
import { DB } from './database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: PrismaClient) {}

  findAll() {
    return this.db.user.findMany();
  }
}
```

### 6.6 认证与鉴权：用 Guard 做“入口闸门”

最常见的做法是：在 Guard 里检查登录态/权限，不通过就直接抛异常。

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('未登录');
    }
    return true;
  }
}
```

用法：

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  @UseGuards(AuthGuard)
  @Get('stats')
  stats() {
    return { ok: true };
  }
}
```

### 6.7 统一响应格式：用 Interceptor 包一层

当你想让所有接口都返回统一结构（方便前端处理），可以用拦截器。

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
```

### 6.8 业务错误更“可控”：用自定义异常 + 过滤器

内置异常够用，但你也可以抽象出项目级异常，统一转成你想要的响应结构。

```typescript
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal Server Error';

    response.status(status).json({ message });
  }
}
```

### 6.9 文件上传：platform-express 自带能力

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return { filename: file.originalname, size: file.size };
  }
}
```

### 6.10 和 Next.js 协作时的三个关键点

1. **URL 设计**：统一加全局前缀（本项目是 `/api/v1`）
2. **跨域策略**：开发期允许 `http://localhost:3000`，生产期按域名收紧
3. **Cookie/Session**：如果要用 cookie 登录态，`CORS + credentials` 必须配套正确

---

## 7. 常见陷阱与最佳实践

### ❌ 陷阱 1：忘记注册 Provider

```typescript
// 错误：Service 没有在 Module 中注册
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}  // 报错！
}

// 正确：在 Module 中注册
@Module({
  providers: [UsersService],  // ✅ 注册
  controllers: [UsersController],
})
export class UsersModule {}
```

### ❌ 陷阱 2：DTO 验证不生效

```typescript
// 错误：没有加装饰器
export class CreateUserDto {
  email: string;  // 不会验证
}

// 正确：加上验证装饰器
export class CreateUserDto {
  @IsEmail()
  email: string;  // ✅ 会验证
}

// 同时确保 main.ts 中启用了 ValidationPipe
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

### ❌ 陷阱 3：在 Controller 中写业务逻辑

```typescript
// 错误：Controller 太臃肿
@Controller('users')
export class UsersController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const email = dto.email.trim().toLowerCase();
    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      throw new BadRequestException('邮箱已被注册');
    }
    return db.user.create({ data: { ...dto, email } });
  }
}

// 正确：业务逻辑放到 Service
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);  // ✅ 简洁
  }
}
```

### ✅ 最佳实践

1. **分层清晰**
   - Controller：只处理 HTTP 相关
   - Service：业务逻辑
   - Repository/Prisma：数据访问

2. **使用 DTO**
   - 所有输入都通过 DTO 验证
   - 使用 class-validator 装饰器

3. **统一异常处理**
   - 使用内置异常类
   - 或创建全局异常过滤器

4. **模块化组织**
   - 每个功能一个模块
   - 相关代码放在一起

---

## 8. 总结

### 记住这 5 点就够了

1. **Module** 组织代码，**Controller** 接收请求，**Service** 处理逻辑
2. **装饰器**告诉 NestJS 这是什么（`@Controller`、`@Get`、`@Injectable`）
3. **依赖注入**：在构造函数声明需要的服务，NestJS 自动提供
4. **DTO + ValidationPipe**：验证请求数据
5. **使用内置异常**：`NotFoundException`、`BadRequestException` 等

### NestJS 的核心价值

```
Express：自由但混乱，项目大了难以维护
NestJS：有约束但清晰，团队协作更顺畅
```

**一句话总结**：NestJS 用模块化和依赖注入让 Node.js 后端代码更有组织。
