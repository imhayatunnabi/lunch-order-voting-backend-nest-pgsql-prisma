import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: hashedPassword,
        },
        include: {
          Vote: true,
        },
      });

      const { ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
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
        email: { contains: search, mode: 'insensitive' },
      };
    }
    const total = await this.prisma.user.count({ where });
    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        Vote: {
          include: {
            restaurant: true,
            food: true,
          },
        },
      },
      orderBy: { email: 'asc' },
    });
    const sanitizedUsers = users.map((user) => {
      const { ...result } = user;
      return result;
    });
    const lastPage = Math.ceil(total / limit);
    const baseUrl = 'users';
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
      data: sanitizedUsers,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        Vote: {
          include: {
            restaurant: true,
            food: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.findOne(id);

      const data: any = {};
      if (updateUserDto.email) {
        data.email = updateUserDto.email;
      }
      if (updateUserDto.password) {
        data.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        include: {
          Vote: {
            include: {
              restaurant: true,
              food: true,
            },
          },
        },
      });

      const { ...result } = updatedUser;
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const user = await this.prisma.user.delete({
      where: { id },
      include: {
        Vote: true,
      },
    });

    const { ...result } = user;
    return result;
  }
}
