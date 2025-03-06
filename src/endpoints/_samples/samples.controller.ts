import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../../utils/logger/logger.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import {
  CreateSampleDto,
  SampleResponseDto,
  UpdateSampleDto,
} from './dto';
import { SamplesService } from './samples.service';

@ApiTags('samples')
@ApiBearerAuth('firebase-jwt')
@UseGuards(FirebaseAuthGuard)
@Controller('samples')
export class SamplesController {
  constructor(
    private readonly samplesService: SamplesService,
    private readonly logger: LoggerService
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all samples' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all samples successfully',
    type: [SampleResponseDto],
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter samples by user ID',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query('userId') userId?: string) {
    try {
      const res = userId
        ? await this.samplesService.findAllByUserId(userId)
        : await this.samplesService.findAll();
      return res;
    } catch (err) {
      this.logger.error('Error retrieving samples', err);
      throw new HttpException(
        'Error retrieving samples',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the sample to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved sample successfully',
    type: SampleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string) {
    try {
      const res = await this.samplesService.findById(id);
      if (!res) {
        throw new NotFoundException(`Sample with ID ${id} not found`);
      }
      return res;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      this.logger.error(`Error retrieving sample with ID ${id}`, err);
      throw new HttpException(
        `Error retrieving sample with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sample' })
  @ApiBody({ type: CreateSampleDto })
  @ApiResponse({
    status: 201,
    description: 'Sample created successfully',
    type: SampleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createSampleDto: CreateSampleDto) {
    try {
      const res = await this.samplesService.create(createSampleDto);
      
      // If there's a duplicate flag, modify the response message
      if (res && '_duplicate' in res) {
        return {
          ...res,
          message: 'Sample with this name already exists',
        };
      }
      return res;
    } catch (err) {
      this.logger.error('Error creating sample', err);
      if (err.status === HttpStatus.BAD_REQUEST) {
        throw err;
      }
      throw new HttpException(
        'Error creating sample',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a sample' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the sample to update',
  })
  @ApiBody({ type: UpdateSampleDto })
  @ApiResponse({
    status: 200,
    description: 'Sample updated successfully',
    type: SampleResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateSampleDto: UpdateSampleDto) {
    try {
      const res = await this.samplesService.update(id, updateSampleDto);
      return res;
    } catch (err) {
      this.logger.error(`Error updating sample with ID ${id}`, err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new HttpException(
        `Error updating sample with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sample' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'The ID of the sample to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Sample deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Sample not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    try {
      await this.samplesService.remove(id);
      return { message: `Sample with ID ${id} deleted successfully` };
    } catch (err) {
      this.logger.error(`Error deleting sample with ID ${id}`, err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new HttpException(
        `Error deleting sample with ID ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
