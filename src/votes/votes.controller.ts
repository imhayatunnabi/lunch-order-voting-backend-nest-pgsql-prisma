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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a vote for a food item' })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({ status: 201, description: 'Vote successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 404,
    description: 'Food not found in this restaurant',
  })
  @ApiResponse({
    status: 409,
    description: 'Already voted for this restaurant today',
  })
  create(@Request() req, @Body() createVoteDto: CreateVoteDto) {
    return this.votesService.create(req.user.sub, createVoteDto);
  }

  @Get('top-restaurants')
  @ApiOperation({ summary: 'Get top restaurants by vote count' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of top restaurants with vote counts',
  })
  getTopRestaurants(@Query() paginationQuery: PaginationQueryDto) {
    return this.votesService.getTopRestaurants(paginationQuery);
  }
}
