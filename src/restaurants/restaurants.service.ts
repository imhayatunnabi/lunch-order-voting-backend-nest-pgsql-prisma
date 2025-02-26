import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) { }

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

  async findAll() {
    return this.prisma.restaurant.findMany({
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
