import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@Exclude()
export class CreatePostDto {
  @Expose()
  @MinLength(2)
  @MaxLength(255)
  @IsNotEmpty()
  title: string;

  @Expose()
  @MinLength(1)
  @MaxLength(255)
  @IsNotEmpty()
  content: string;
}

@Exclude()
export class CreatePostResponse {
  @Expose()
  id: number;

  @Expose()
  title: string;
}
