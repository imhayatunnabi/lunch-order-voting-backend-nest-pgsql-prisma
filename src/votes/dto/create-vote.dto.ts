import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  foodId: string;

  @IsString()
  @IsNotEmpty()
  restaurantId: string;
}
