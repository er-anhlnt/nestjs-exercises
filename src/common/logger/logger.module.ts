import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from './request-logger.middleware';
import { LoggerService } from './logger.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseLoggingInterceptor } from './response-logger.interceptor';
import { GlobalFilter } from './exception.filter';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
  ],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
