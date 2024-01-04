import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = Date.now();

    return next.handle().pipe(
      tap(async (data: any) => {
        const response = context.switchToHttp().getResponse();

        Logger.log(
          this.loggerService.getResponseLogString(
            response,
            data,
            Date.now() - now,
          ),
          'Response',
        );
      }),
    );
  }
}
