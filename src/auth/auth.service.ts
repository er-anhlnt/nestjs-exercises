import { SignupDto } from './dto/signup.dto';
import { plainToClass } from 'class-transformer';
import { User } from 'src/users/entity/users.entity';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from './dto/currentUser';
import { randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entity/refresh-token.entity';
import { Repository } from 'typeorm';
import { addMonths, isAfter } from 'date-fns';
import { LoginRequest } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

// @Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(signupDto: SignupDto) {
    const user = plainToClass(User, signupDto);

    const isExisted = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });

    if (isExisted) {
      throw new BadRequestException('User is already existed');
    }

    user.password = await bcrypt.hash(user.password, 10);

    return this.usersRepository.save(user);
  }

  async login(loginDto: LoginRequest) {
    const user = await this.usersRepository.findOne({
      where: {
        email: loginDto.email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    const isMatched = await bcrypt.compare(loginDto.password, user.password);

    if (!isMatched) {
      throw new BadRequestException('Wrong password');
    }

    const payload: CurrentUser = {
      id: user.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.createRefreshToken(user.id),
    ]);

    const expiresIn =
      Date.now() + this.configService.get<number>('JWT_EXPIRES') * 1000;

    return { accessToken, refreshToken, expiresIn };
  }

  async createRefreshToken(userId: number, parent?: string) {
    const refreshTokenPromise = new Promise<string>((resolve, reject) => {
      randomBytes(32, (err, buf) => {
        if (err) reject(err);

        resolve(buf.toString('hex'));
      });
    });

    const refreshToken = await refreshTokenPromise;

    await this.refreshTokenRepository.save({
      isActive: false,
      token: refreshToken,
      expiredAt: addMonths(new Date(), 6),
      parent: parent || refreshToken,
      user: {
        id: userId,
      },
    });

    return refreshToken;
  }

  async getNewAccessToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: token },
      relations: {
        user: true,
      },
      select: {
        user: { id: true, email: true },
      },
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (isAfter(new Date(), refreshToken.expiredAt)) {
      throw new UnauthorizedException('Refresh token is expired');
    }

    // If refresh token has been already used, deleted all the refresh token in the family
    if (refreshToken.isActive) {
      await this.refreshTokenRepository.delete({ parent: refreshToken.parent });

      throw new UnauthorizedException('Invalid refresh token');
    }

    refreshToken.isActive = true;
    await this.refreshTokenRepository.save(refreshToken);

    const payload: CurrentUser = {
      id: refreshToken.user.id,
    };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.createRefreshToken(payload.id, refreshToken.parent),
    ]);

    const expiresIn =
      Date.now() + this.configService.get<number>('JWT_EXPIRES') * 1000;

    return { newAccessToken, newRefreshToken, expiresIn };
  }

  async logout(token: string) {
    const refreshToken = await this.refreshTokenRepository.findOneBy({ token });

    if (!refreshToken) {
      return;
    }

    await this.refreshTokenRepository.delete({ parent: refreshToken.parent });
  }
}
