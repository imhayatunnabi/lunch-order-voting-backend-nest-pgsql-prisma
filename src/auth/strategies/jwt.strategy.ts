import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
    console.log(
      'JWT Strategy initialized with secret:',
      configService.get<string>('JWT_SECRET')?.substring(0, 3) + '...',
    );
  }

  async validate(payload: any) {
    console.log('Validating JWT payload:', payload);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      console.error(`User with ID ${payload.sub} not found`);
      throw new UnauthorizedException('User not found');
    }

    console.log('User found:', user.email);
    return { userId: payload.sub, email: payload.email };
  }
}
