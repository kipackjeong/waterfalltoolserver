import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '../../utils/logger/logger.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`, 'AuthController');
    try {
      const res = await this.authService.register(registerDto);
      this.logger.log(`User registered successfully: ${registerDto.email}`, 'AuthController');
      return res;
    } catch (err) {
      this.logger.error(`Registration failed for ${registerDto.email}: ${err.message}`, err.stack, 'AuthController');
      throw new HttpException(
        err.message || 'Registration failed',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`, 'AuthController');
    try {
      const res = await this.authService.login(loginDto);
      this.logger.log(`User logged in successfully: ${loginDto.email}`, 'AuthController');
      return res;
    } catch (err) {
      this.logger.error(`Login failed for ${loginDto.email}: ${err.message}`, err.stack, 'AuthController');
      throw new HttpException(
        err.message || 'Login failed',
        err.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('verify-token')
  @ApiBearerAuth('firebase-jwt')
  @ApiOperation({ summary: 'Verify Firebase JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token successfully verified',
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        user: {
          type: 'object',
          properties: {
            uid: { type: 'string', example: 'abc123' },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  verifyToken(@Req() req) {
    this.logger.log(`Token verification for user: ${req.user?.uid || 'unknown'}`, 'AuthController');
    return {
      success: true,
      user: req.user
    };
  }
}
