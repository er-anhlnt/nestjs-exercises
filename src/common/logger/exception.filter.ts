import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Response } from 'express';

@Catch(HttpException)
export class GlobalFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest();
    const res = host.switchToHttp().getResponse<Response>();
    Logger.error(
      this.loggerService.getRequestErrorLog(req, res, exception),
      'Request',
    );

    res.status(exception.getStatus()).json(exception.getResponse());
  }
}
