import { Food as PrismaFood, Prisma } from '@prisma/client';

export class Food implements PrismaFood {
  id: string;
  name: string;
  price: Prisma.Decimal;
  restaurantId: string;
}
