import { ApiProperty } from '@nestjs/swagger';

export class VoteResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  foodId: string;

  @ApiProperty()
  restaurantId: string;

  @ApiProperty()
  createdAt: Date;
}

export class RestaurantVoteCount {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  voteCount: number;
}

export class PaginatedTopRestaurantResponse {
  @ApiProperty({ type: [RestaurantVoteCount] })
  data: RestaurantVoteCount[];

  @ApiProperty({
    type: 'object',
    properties: {
      currentPage: { type: 'number' },
      itemsPerPage: { type: 'number' },
      totalItems: { type: 'number' },
      totalPages: { type: 'number' },
    },
  })
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}
