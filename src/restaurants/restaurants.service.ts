import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    try {
      const restaurant = await this.prisma.restaurant.create({
        data: createRestaurantDto,
        include: {
          FoodItem: true,
          Vote: {
            include: {
              user: true,
              food: true,
            },
          },
        },
      });
      return restaurant;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Restaurant name already exists');
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
          { address: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const total = await this.prisma.restaurant.count({ where });
    const restaurants = await this.prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      include: {
        FoodItem: true,
        Vote: {
          include: {
            user: true,
            food: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const lastPage = Math.ceil(total / limit);
    const baseUrl = 'restaurants';
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
      data: restaurants,
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
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        FoodItem: true,
        Vote: {
          include: {
            user: true,
            food: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    try {
      await this.findOne(id);

      return await this.prisma.restaurant.update({
        where: { id },
        data: updateRestaurantDto,
        include: {
          FoodItem: true,
          Vote: {
            include: {
              user: true,
              food: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Restaurant name already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.restaurant.delete({
      where: { id },
      include: {
        FoodItem: true,
        Vote: {
          include: {
            user: true,
            food: true,
          },
        },
      },
    });
  }
}
