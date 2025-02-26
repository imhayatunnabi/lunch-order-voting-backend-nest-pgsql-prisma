import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { FoodsModule } from './foods/foods.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    RestaurantsModule,
    FoodsModule,
  ],
})
export class AppModule {}
