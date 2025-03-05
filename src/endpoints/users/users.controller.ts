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
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
} from './dto';

@ApiTags('users')
@ApiBearerAuth('firebase-jwt')
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all users successfully',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll() {
    try {
      const res = await this.usersService.findAll();
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to retrieve users',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('auth')
  @ApiOperation({ summary: 'Get all Firebase Authentication users' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved all auth users successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAuthUsers() {
    try {
      const res = await this.usersService.getAuthUsers();
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to retrieve auth users',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string) {
    try {
      const res = await this.usersService.findById(id);
      if (!res) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || `Failed to retrieve user ${id}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({
    status: 200,
    description: 'Retrieved user successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findByEmail(@Param('email') email: string) {
    try {
      const res = await this.usersService.findByEmail(email);
      if (!res) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || `Failed to retrieve user by email ${email}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const res = await this.usersService.create(createUserDto);
      // Check if user already exists
      if (res && '_duplicate' in res) {
        return {
          ...res,
          message: 'User with this email already exists',
        };
      }
      return res;
    } catch (err) {
      throw new HttpException(
        err.message || 'Failed to create user',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const res = await this.usersService.update(id, updateUserDto);
      return res;
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new HttpException(
        err.message || `Failed to update user ${id}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'User abc123 deleted successfully'
        }
      }
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(id);
      return { message: `User ${id} deleted successfully` };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new HttpException(
        err.message || `Failed to delete user ${id}`,
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
