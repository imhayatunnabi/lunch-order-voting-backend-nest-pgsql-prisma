import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  address?: string;
}
