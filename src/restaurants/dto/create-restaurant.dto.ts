import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRestaurantDto {
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    address: string;
}
