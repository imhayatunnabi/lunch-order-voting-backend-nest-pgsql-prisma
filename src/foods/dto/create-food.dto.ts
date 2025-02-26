import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFoodDto {
  @ApiProperty({
    example: 'Chicken Burger',
    description: 'Name of the food item',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 9.99,
    description: 'Price of the food item',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the restaurant this food belongs to',
  })
  @IsUUID()
  restaurantId: string;
}
