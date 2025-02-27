import { Injectable /*OnModuleInit*/ } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService /*implements OnModuleInit*/ {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // async onModuleInit() {
  //   await this.emailQueue.removeRepeatable('top-restaurants-periodic', {
  //     cron: '*/3 * * * *',
  //   });
  //   await this.emailQueue.add(
  //     'top-restaurants-periodic',
  //     {},
  //     {
  //       repeat: {
  //         cron: '*/3 * * * *',
  //       },
  //       delay: 180000,
  //     },
  //   );
  // }

  async sendVoteConfirmation(
    email: string,
    restaurantName: string,
    foodName: string,
  ) {
    await this.emailQueue.add(
      'vote-confirmation',
      {
        email,
        restaurantName,
        foodName,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async sendTopRestaurantsToAllUsers(restaurants: any[]) {
    const users = await this.prisma.user.findMany();

    for (const user of users) {
      await this.emailQueue.add(
        'top-restaurants',
        {
          email: user.email,
          restaurants,
        },
        {
          delay: Math.random() * 5000 + 5000,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
    }
  }
}
