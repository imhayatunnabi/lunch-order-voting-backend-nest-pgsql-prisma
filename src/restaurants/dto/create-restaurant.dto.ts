import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRestaurantDto {
  @ApiProperty({
    example: 'Restaurant Name',
    description: 'Name of the restaurant',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    example: '123 Main St, City, Country',
    description: 'Physical address of the restaurant',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  address: string;
}
