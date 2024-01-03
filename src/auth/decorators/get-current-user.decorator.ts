import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    return req.user;
  },
);
