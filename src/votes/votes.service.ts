import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVoteDto: CreateVoteDto) {
    const food = await this.prisma.food.findFirst({
      where: {
        id: createVoteDto.foodId,
        restaurantId: createVoteDto.restaurantId,
      },
    });

    if (!food) {
      throw new NotFoundException('Food not found in this restaurant');
    }
    const existingVote = await this.prisma.vote.findFirst({
      where: {
        userId,
        restaurantId: createVoteDto.restaurantId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (existingVote) {
      throw new ConflictException(
        'You have already voted for this restaurant today',
      );
    }

    return this.prisma.vote.create({
      data: {
        userId,
        foodId: createVoteDto.foodId,
        restaurantId: createVoteDto.restaurantId,
      },
      include: {
        user: true,
        food: true,
        restaurant: true,
      },
    });
  }

  async getTopRestaurants(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page || 1);
    const limit = Number(paginationQuery.limit || 10);
    const { search } = paginationQuery;
    const skip = (page - 1) * limit;
    let where = {};
    if (search) {
      where = {
        name: { contains: search, mode: 'insensitive' },
      };
    }
    const total = await this.prisma.restaurant.count({ where });
    const restaurants = await this.prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      include: {
        FoodItem: {
          include: {
            Vote: true,
          },
        },
        Vote: {
          include: {
            user: true,
            food: true,
          },
        },
        _count: {
          select: {
            Vote: true,
          },
        },
      },
      orderBy: {
        Vote: {
          _count: 'desc',
        },
      },
    });
    const formattedRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      totalVotes: restaurant._count.Vote,
      todayVotes: restaurant.Vote.filter(
        (vote) => vote.createdAt.toDateString() === new Date().toDateString(),
      ).length,
    }));

    const lastPage = Math.ceil(total / limit);
    const baseUrl = 'votes/top-restaurants';

    return {
      data: formattedRestaurants,
      meta: {
        total,
        per_page: limit,
        current_page: page,
        last_page: lastPage,
        from: skip + 1,
        to: Math.min(skip + limit, total),
      },
      links: {
        first: `${baseUrl}?page=1&limit=${limit}${search ? `&search=${search}` : ''}`,
        last: `${baseUrl}?page=${lastPage}&limit=${limit}${search ? `&search=${search}` : ''}`,
        prev:
          page > 1
            ? `${baseUrl}?page=${page - 1}&limit=${limit}${search ? `&search=${search}` : ''}`
            : null,
        next:
          page < lastPage
            ? `${baseUrl}?page=${page + 1}&limit=${limit}${search ? `&search=${search}` : ''}`
            : null,
        current: `${baseUrl}?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
      },
    };
  }
}
