import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

interface PrismaErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
}

/**
 * Prisma 错误码映射
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  P2000: { status: HttpStatus.BAD_REQUEST, message: 'Value too long for column' },
  P2001: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
  P2002: { status: HttpStatus.CONFLICT, message: 'Unique constraint violation' },
  P2003: { status: HttpStatus.BAD_REQUEST, message: 'Foreign key constraint failed' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorInfo = PRISMA_ERROR_MAP[exception.code] || {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error',
    };

    this.logger.warn(
      `Prisma error ${exception.code}: ${exception.message}`,
      {
        code: exception.code,
        meta: exception.meta,
        path: request.url,
      },
    );

    const errorResponse: PrismaErrorResponse = {
      success: false,
      statusCode: errorInfo.status,
      message: errorInfo.message,
      code: exception.code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(errorInfo.status).json(errorResponse);
  }
}

@Catch(Prisma.PrismaClientValidationError)
export class PrismaValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaValidationFilter.name);

  catch(exception: Prisma.PrismaClientValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.error(`Prisma validation error: ${exception.message}`);

    response.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
