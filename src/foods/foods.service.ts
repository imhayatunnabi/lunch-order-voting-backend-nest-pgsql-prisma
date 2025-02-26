import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

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

  async findAll() {
    return this.prisma.food.findMany({
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
