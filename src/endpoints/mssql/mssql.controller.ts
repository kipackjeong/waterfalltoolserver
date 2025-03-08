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
  ApiBody,
} from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { MssqlResponseDto } from './dto/mssql-response.dto';
import { QueryMssqlDto } from './dto/query-mssql.dto';
import { MssqlService } from './mssql.service';

@ApiTags('mssql')
@ApiBearerAuth('firebase-jwt')
@UseGuards(FirebaseAuthGuard)
@Controller('mssql')
export class MssqlController {
  constructor(
    private readonly mssqlService: MssqlService,
    private readonly logger: LoggerService
  ) { }

  @Post('query')
  @ApiOperation({ summary: 'Query SQL' })
  @ApiBody({ type: QueryMssqlDto })
  @ApiResponse({
    status: 201,
    description: 'Query executed successfully',
    type: MssqlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async query(@Body() queryMssqlDto: QueryMssqlDto) {
    console.log('queryMssqlDto:', queryMssqlDto)
    try {
      const res = await this.mssqlService.query(queryMssqlDto.config, queryMssqlDto.query);
      return { message: 'Not implemented', data: res };
    } catch (err) {
      this.logger.error('Error creating mssql', err);
      if (err.status === HttpStatus.BAD_REQUEST) {
        throw err;
      }
      throw new HttpException(
        'Error creating mssql',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
