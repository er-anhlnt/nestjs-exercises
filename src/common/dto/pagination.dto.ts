import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @Min(0)
  @IsInt()
  @IsOptional()
  readonly offset?: number = 0;

  @Type(() => Number)
  @Min(1)
  @IsInt()
  @IsOptional()
  readonly limit?: number = 20;
}

export class PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
}
