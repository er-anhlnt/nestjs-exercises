import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/users.entity';

// @Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  getUsers() {
    return this.usersRepository.findAndCount({
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
      },
    });
  }
}
