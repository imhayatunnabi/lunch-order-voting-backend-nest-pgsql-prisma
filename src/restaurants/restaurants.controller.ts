import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('restaurants')
@ApiBearerAuth('token')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'Restaurant name already exists' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of restaurants with pagination',
  })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.restaurantsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant found' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 409, description: 'Restaurant name already exists' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(id);
  }
}
