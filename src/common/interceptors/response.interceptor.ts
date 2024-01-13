import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ResponseMessageKey } from '../decorators/response-message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const message = this.reflector.get(
      ResponseMessageKey,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        return {
          data: data,
          status_code: context.switchToHttp().getResponse().statusCode,
          message: message,
        };
      }),
    );
  }
}
