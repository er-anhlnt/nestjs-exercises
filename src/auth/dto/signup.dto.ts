import { Exclude, Expose } from 'class-transformer';
import { IsAlpha, IsEmail, MaxLength, MinLength } from 'class-validator';

@Exclude()
export class SignupDto {
  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  // @Matches(/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-z])(?=.*[0-9]).{8,}$/)
  @MinLength(6)
  @MaxLength(255)
  password: string;

  @Expose()
  @MinLength(2)
  @MaxLength(255)
  @IsAlpha()
  firstName: string;

  @Expose()
  @MinLength(2)
  @MaxLength(255)
  @IsAlpha()
  lastName: string;
}

@Exclude()
export class SignupResponse {
  @Expose()
  message: string;
}
