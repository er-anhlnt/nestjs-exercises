import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Request } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}
  use(req: Request, res: any, next: (error?: any) => void) {
    const id = uuid();
    req['id'] = id;

    Logger.log(this.loggerService.getRequestLogString(req), 'Request');

    next();
  }
}
