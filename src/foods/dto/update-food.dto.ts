import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateFoodDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}
