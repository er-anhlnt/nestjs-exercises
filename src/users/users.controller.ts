import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    const [users, count] = await this.usersService.getUsers();

    return { data: users, count };
  }

  @Get('secret')
  @UseGuards(AuthGuard)
  getSecret() {
    return 'secret';
  }
}
