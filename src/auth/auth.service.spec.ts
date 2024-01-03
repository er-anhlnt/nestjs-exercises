import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { User } from 'src/users/entity/users.entity';
import { RefreshToken } from './entity/refresh-token.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  const usersRepository = {
    save: jest.fn(async (user) => {
      return {
        id: 1,
        ...user,
        password: await hash(user.password, 10),
      };
    }),
    exist: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        ConfigService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            save: jest.fn((payload) => {
              return payload;
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: usersRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(() => {
              return 'jwttoken';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup()', () => {
    it('it should sign up successfully', async () => {
      const user = {
        email: 'john@gmail.com',
        lastName: 'John',
        firstName: 'Doe',
        password: 'Strongpassword@123',
      };

      const result = await service.signup(user);

      usersRepository.exist.mockResolvedValue(false);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toEqual(user.email);
      expect(result.lastName).toEqual(user.lastName);
      expect(result.firstName).toEqual(user.firstName);
      expect(compare(user.password, result.password));
    });

    it('it should signup fail, user already exist', async () => {
      const user = {
        email: 'Rachel@gmail.com',
        lastName: 'John',
        firstName: 'Doe',
        password: 'Strongpassword@123',
      };

      usersRepository.exist.mockResolvedValue(true);

      try {
        const res = await service.signup(user);
        expect(res).not.toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('User is already existed');
      }
    });
  });

  describe('login()', () => {
    it('it should login successfully', async () => {
      const user = {
        email: 'john@gmail.com',
        password: 'Strongpassword@123',
      };

      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'john@gmail.com',
        password: await hash(user.password, 10),
      });

      try {
        const result = await service.login(user);
        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.accessToken).not.toEqual('');
        expect(result.refreshToken).toBeDefined();
        expect(result.refreshToken).not.toEqual('');
      } catch (error) {
        console.log(error);
      }
    });

    it('it should login fail. User does not exist', async () => {
      const user = {
        email: 'Rachel@gmail.com',
        password: 'Strongpassword@123',
      };

      usersRepository.findOne.mockResolvedValue(undefined);

      try {
        await service.login(user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('User does not exist');
        expect(error.status).toEqual(404);
      }
    });

    it('it should login fail. Wrong password', async () => {
      const user = {
        email: 'john@gmail.com',
        password: 'Strongpassword',
      };

      usersRepository.findOne.mockResolvedValue({
        email: 'john@gmail.com',
        password: await hash('Strongpassword@gmail.com', 10),
      });

      try {
        await service.login(user);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual('Wrong password');
        expect(error.status).toEqual(400);
      }
    });

    it('it should create refresh token length of 64', async () => {
      const refreshToken = await service.createRefreshToken(1);
      expect(refreshToken).not.toEqual('');
      expect(refreshToken.length).toEqual(64);
    });
  });
});
