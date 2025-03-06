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
  NotFoundException,
  Query,
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
  CreateProjectDto,
  ProjectResponseDto,
  UpdateProjectDto,
} from './dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@ApiBearerAuth('firebase-jwt') /** tells Swagger UI that these endpoints require a bearer token. This creates an "Authorize" button in Swagger UI where users can input their token
*/
@UseGuards(FirebaseAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService, private readonly logger: LoggerService) { }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all projects successfully',
    type: [ProjectResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      const res = await this.projectsService.findAll();
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to retrieve projects',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-user')
  @ApiOperation({ summary: 'Get projects by user ID' })
  @ApiQuery({ name: 'userId', description: 'User ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'Retrieved projects successfully',
    type: ProjectResponseDto,
    isArray: true
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllByUserId(@Query('userId') userId: string) {
    this.logger.log(`Finding projects by user ID: ${userId}`, 'ProjectsController');
    console.log('userId:', userId)
    try {
      const res = await this.projectsService.findAllByUserId(userId);
      if (!res || res.length === 0) {
        return { message: `No projects found with user ID ${userId}`, data: [] };
      }
      return { message: `Projects with user ID ${userId} found`, data: res };
    } catch (err) {
      throw new HttpException(
        err.message || `Failed to retrieve projects with user ID: ${userId}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post() // POST /projects
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    try {
      const res = await this.projectsService.create(createProjectDto);
      // Check if project already exists
      if (res && '_duplicate' in res) {
        return {
          ...res,
          message: 'Project with this name already exists',
        };
      }
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to create project',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: ProjectResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    try {
      const res = await this.projectsService.update(id, updateProjectDto);
      return res;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new HttpException(
        err.message || `Failed to update project ${id}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Project abc123 deleted successfully'
        }
      }
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    try {
      await this.projectsService.remove(id);
      return { message: `Project ${id} deleted successfully` };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new HttpException(
        err.message || `Failed to delete project ${id}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
