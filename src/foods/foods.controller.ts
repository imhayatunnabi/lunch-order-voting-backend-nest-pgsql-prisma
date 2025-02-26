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
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
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

@ApiTags('foods')
@ApiBearerAuth('JWT-auth')
@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new food item' })
  @ApiResponse({ status: 201, description: 'Food item successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  @ApiResponse({ status: 409, description: 'Food item already exists' })
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food items with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of food items with pagination',
  })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.foodsService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food item by ID' })
  @ApiParam({ name: 'id', description: 'Food ID' })
  @ApiResponse({ status: 200, description: 'Food item found' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a food item' })
  @ApiParam({ name: 'id', description: 'Food ID' })
  @ApiResponse({ status: 200, description: 'Food item updated successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  @ApiResponse({ status: 409, description: 'Food item already exists' })
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a food item' })
  @ApiParam({ name: 'id', description: 'Food ID' })
  @ApiResponse({ status: 200, description: 'Food item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  remove(@Param('id') id: string) {
    return this.foodsService.remove(id);
  }
}
