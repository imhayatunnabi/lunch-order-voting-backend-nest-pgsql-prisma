import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async create(createFoodDto: CreateFoodDto) {
    try {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: createFoodDto.restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      return await this.prisma.food.create({
        data: createFoodDto,
        include: {
          restaurant: true,
          Vote: {
            include: {
              user: true,
              restaurant: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Food item already exists');
        }
      }
      throw error;
    }
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page || 1);
    const limit = Number(paginationQuery.limit || 10);
    const { search } = paginationQuery;
    const skip = (page - 1) * limit;
    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { restaurant: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }
    const total = await this.prisma.food.count({ where });
    const foods = await this.prisma.food.findMany({
      where,
      skip,
      take: limit,
      include: {
        restaurant: true,
        Vote: {
          include: {
            user: true,
            restaurant: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    const lastPage = Math.ceil(total / limit);
    const baseUrl = 'foods';
    const links = {
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
    };

    return {
      data: foods,
      meta: {
        total,
        per_page: limit,
        current_page: page,
        last_page: lastPage,
        from: skip + 1,
        to: Math.min(skip + limit, total),
      },
      links,
    };
  }

  async findOne(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
      include: {
        restaurant: true,
        Vote: {
          include: {
            user: true,
            restaurant: true,
          },
        },
      },
    });

    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`);
    }

    return food;
  }

  async update(id: string, updateFoodDto: UpdateFoodDto) {
    try {
      await this.findOne(id);

      return await this.prisma.food.update({
        where: { id },
        data: updateFoodDto,
        include: {
          restaurant: true,
          Vote: {
            include: {
              user: true,
              restaurant: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Food item already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.food.delete({
      where: { id },
      include: {
        restaurant: true,
        Vote: {
          include: {
            user: true,
            restaurant: true,
          },
        },
      },
    });
  }
}
