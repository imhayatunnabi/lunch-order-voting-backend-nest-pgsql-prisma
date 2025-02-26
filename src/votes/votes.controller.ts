import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createVoteDto: CreateVoteDto) {
    return this.votesService.create(req.user.sub, createVoteDto);
  }

  @Get('top-restaurants')
  getTopRestaurants(@Query() paginationQuery: PaginationQueryDto) {
    return this.votesService.getTopRestaurants(paginationQuery);
  }
}
