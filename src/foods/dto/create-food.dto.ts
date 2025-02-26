import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFoodDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
