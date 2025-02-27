import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

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
}
