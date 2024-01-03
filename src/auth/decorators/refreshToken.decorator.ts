import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const RefreshToken = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    return request.cookies['refresh-token'];
  },
);
