import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { FoodsModule } from './foods/foods.module';
import { VotesModule } from './votes/votes.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    PrismaModule,
    UsersModule,
    RestaurantsModule,
    FoodsModule,
    VotesModule,
  ],
})
export class AppModule {}
