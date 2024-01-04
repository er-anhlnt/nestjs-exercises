import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PostFields } from '../entities/posts.enum';
import { SortedFields } from 'src/common/validators/sort-params.validator';

export class GetPostsDto extends PaginationDto {
  @Transform(({ value }) => value.split(','))
  @Validate(SortedFields, [PostFields], { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @IsOptional()
  sort: string[];

  @Transform(({ value }) => value.split(','))
  @IsEnum(PostFields, { each: true })
  @IsNotEmpty({ each: true })
  @IsArray()
  @IsOptional()
  fields: string[] = Object.values(PostFields);
}
