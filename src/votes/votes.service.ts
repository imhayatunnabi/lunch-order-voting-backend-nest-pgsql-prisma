import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class VotesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, createVoteDto: CreateVoteDto) {
    const food = await this.prisma.food.findUnique({
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
        userId: userId,
        foodId: createVoteDto.foodId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted for this food today');
    }

    const vote = await this.prisma.vote.create({
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

    // Send email confirmation
    await this.emailService.sendVoteConfirmation(
      vote.user.email,
      vote.restaurant.name,
      vote.food.name,
    );

    return vote;
  }

  async getTopRestaurants(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = paginationQuery;
    const skip = (page - 1) * limit;

    const restaurants = await this.prisma.restaurant.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
        address: true,
        _count: {
          select: {
            Vote: {
              where: {
                createdAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
              },
            },
          },
        },
      },
      orderBy: {
        Vote: {
          _count: 'desc',
        },
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.restaurant.count({
      where: search
        ? {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
    });

    return {
      data: restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        voteCount: restaurant._count.Vote,
      })),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
