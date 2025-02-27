import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  @Process('vote-confirmation')
  async handleVoteConfirmation(job: Job) {
    const { email, restaurantName, foodName } = job.data;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Vote Confirmation',
        html: `
          <h1>Vote Confirmation</h1>
          <p>Thank you for your vote!</p>
          <p>You voted for ${foodName} from ${restaurantName}.</p>
          <p>Have a great meal!</p>
        `,
      });

      this.logger.log(`Vote confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw error;
    }
  }

  @Process('top-restaurants')
  async handleTopRestaurants(job: Job) {
    const { email, restaurants } = job.data;
    try {
      const restaurantList = restaurants
        .map((r, index) => `${index + 1}. ${r.name} (${r.voteCount} votes)`)
        .join('\n');

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: email,
        subject: 'Top Restaurants Today',
        html: `
          <h1>Today's Top Restaurants</h1>
          <p>Here are the most voted restaurants today:</p>
          <pre>${restaurantList}</pre>
          <p>Don't forget to vote for your favorite!</p>
        `,
      });
      this.logger.log(`Top restaurants email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
      throw error;
    }
  }

  // @Process('top-restaurants-periodic')
  // async handlePeriodicTopRestaurants() {
  //   this.logger.log('Starting periodic top restaurants email job');

  //   try {
  //     const restaurants = await this.prisma.restaurant.findMany({
  //       take: 5,
  //       select: {
  //         id: true,
  //         name: true,
  //         _count: {
  //           select: {
  //             Vote: {
  //               where: {
  //                 createdAt: {
  //                   gte: new Date(new Date().setHours(0, 0, 0, 0)),
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         Vote: {
  //           _count: 'desc',
  //         },
  //       },
  //     });

  //     const formattedRestaurants = restaurants.map((r) => ({
  //       name: r.name,
  //       voteCount: r._count.Vote,
  //     }));
  //     const users = await this.prisma.user.findMany();
  //     for (const user of users) {
  //       await this.emailQueue.add(
  //         'top-restaurants',
  //         {
  //           email: user.email,
  //           restaurants: formattedRestaurants,
  //         },
  //         {
  //           delay: Math.random() * 5000 + 5000,
  //           attempts: 3,
  //           backoff: {
  //             type: 'exponential',
  //             delay: 1000,
  //           },
  //         },
  //       );
  //     }

  //     this.logger.log(`Queued emails for ${users.length} users`);
  //   } catch (error) {
  //     this.logger.error('Failed to process periodic top restaurants:', error);
  //     throw error;
  //   }
  // }
}
