import { HttpException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerService {
  private SENSITIVE_DATA = new Set([
    'x-api-key',
    'password',
    'credit_card',
    'creditCard',
    'pass',
    'api_key',
    'apiKey',
    'refresh-token',
    'token',
  ]);

  getRequestLogString(req: Request) {
    const id = req['id'];
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.baseUrl;
    const headers = JSON.stringify(this.markingSensitiveData(req.headers));
    const body = JSON.stringify(this.markingSensitiveData(req.body));

    return `${timestamp}\t${id}\t${method}\t${url}\theaders=${headers}\tbody=${body}`;
  }

  getResponseLogString(res: Response, data: any, processTime: number) {
    const id = res.req['id'];
    const timestamp = new Date().toISOString();
    const method = res.req.method;
    const url = res.req.originalUrl;
    const status = res.statusCode;
    const user = res.req['user'];
    const headers = JSON.stringify(this.markingSensitiveData(res.req.headers));
    const body = JSON.stringify(this.markingSensitiveData(data));

    return `${timestamp}\t${id}\t${method}\t${url}\t${user?.id}\t${status}\theaders=${headers}\tbody=${body}\t${processTime}ms`;
  }

  getRequestErrorLog(req: Request, res: Response, exception: HttpException) {
    const id = res.req['id'];
    const timestamp = new Date().toISOString();
    const method = res.req.method;
    const url = res.req.originalUrl;
    const status = exception.getStatus();
    const user = res.req['user'];
    const headers = JSON.stringify(this.markingSensitiveData(req.headers));
    const body = JSON.stringify(this.markingSensitiveData(req.body));
    const exceptionStr = JSON.stringify(exception.getResponse());

    return `${timestamp}\t${id}\t${method}\t${url}\t${user?.id}\t${status}\theaders=${headers}\tbody=${body}\t${exceptionStr}`;
  }

  markingSensitiveData(body: any) {
    if (!body) {
      return body;
    }

    if (typeof body === 'object') {
      // make a copy of body in order not to modify the object body directly
      const copy = JSON.parse(JSON.stringify(body));

      Object.keys(copy).forEach((prop) => {
        if (this.SENSITIVE_DATA.has(prop)) {
          copy[prop] = '******';
        }

        if (typeof copy[prop] === 'object') {
          copy[prop] = this.markingSensitiveData(copy[prop]);
        }
      });

      if (Array.isArray(copy)) return [...copy];

      return copy;
    }

    return body;
  }
}
