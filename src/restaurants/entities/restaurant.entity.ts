import { Restaurant as PrismaRestaurant } from '@prisma/client';

export class Restaurant implements PrismaRestaurant {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
