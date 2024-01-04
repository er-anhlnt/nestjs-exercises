import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markingSensitiveData()', () => {
    it('Should return redacted password field', async () => {
      const input = {
        password: 'something',
      };
      const result = service.markingSensitiveData(input);

      expect(result.password).toEqual('******');
    });

    it('Should not tranform array of string', async () => {
      const input = ['password', 'api_key'];
      const result = service.markingSensitiveData(input);

      expect(result).toEqual(input);
    });

    it('Should tranform nested object to marking sensitive fields', async () => {
      const input = {
        password: 'some password',
        b: 'Some public field',
        a: {
          c: 'Some public field',
          api_key: 'some api key',
          b: {
            credit_card: 'some credit card',
          },
        },
      };
      const result = service.markingSensitiveData(input);

      expect(result.password).toEqual('******');
      expect(result.b).not.toEqual('******');
      expect(result.a.api_key).toEqual('******');
      expect(result.a.c).not.toEqual('******');
      expect(result.a.b.credit_card).toEqual('******');
    });

    it('Should not transform input object directly', async () => {
      const input = {
        password: 'some password',
        b: 'Some public field',
        a: {
          c: 'Some public field',
          api_key: 'some api key',
          b: {
            credit_card: 'some credit card',
          },
        },
      };
      const result = service.markingSensitiveData(input);

      expect(result.password).toEqual('******');
      expect(result.password).not.toEqual(input.password);
      expect(result.b).not.toEqual('******');
      expect(result.a.api_key).toEqual('******');
      expect(result.a.api_key).not.toEqual(input.a.api_key);
      expect(result.a.c).not.toEqual('******');
      expect(result.a.b.credit_card).toEqual('******');
      expect(result.a.b.credit_card).not.toEqual(input.a.b.credit_card);
    });
  });
});
