import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(6)
  @MaxLength(255)
  @IsNotEmpty()
  password: string;
}

@Exclude()
export class LoginResponse {
  @Expose()
  token: string;

  @Expose()
  token_type: string;

  @Expose()
  expires_in: number;
}
