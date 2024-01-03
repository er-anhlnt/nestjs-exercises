import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RefreshToken } from './decorators/refreshToken.decorator';
import { plainToInstance } from 'class-transformer';
import { SignupResponse } from './dto/signup.dto';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { RefreshTokenResponse } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto): Promise<SignupResponse> {
    await this.authService.signup(signupDto);

    return plainToInstance(SignupResponse, {
      message: 'Signup successfully',
    });
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const { accessToken, refreshToken, expiresIn } =
      await this.authService.login(loginDto);

    res.cookie('refresh-token', refreshToken, { httpOnly: true });

    return {
      token: accessToken,
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  @Get('/refresh')
  @UseGuards(RefreshTokenGuard)
  async getNewAccessToken(
    @Res({ passthrough: true }) res: Response,
    @RefreshToken() refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    const { newAccessToken, newRefreshToken, expiresIn } =
      await this.authService.getNewAccessToken(refreshToken);

    res.cookie('refresh-token', newRefreshToken, { httpOnly: true });

    return {
      expires_in: expiresIn,
      token_type: 'Bearer',
      token: newAccessToken,
    };
  }

  @Post('/logout')
  @UseGuards(RefreshTokenGuard)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @RefreshToken() refreshToken: string,
  ) {
    await this.authService.logout(refreshToken);

    res.clearCookie('refresh-token');

    return {
      message: 'Logout successfully',
    };
  }
}
