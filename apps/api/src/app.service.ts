import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string } {
    return {
      message: 'Welcome to TheRoadInCode API',
      version: '0.0.1',
    };
  }
}
