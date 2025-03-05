import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = exception.getResponse();
    const errorMessage = 
      typeof errorResponse === 'string'
        ? errorResponse
        : typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : 'Internal server error';

    this.logger.error(
      `${request.method} ${request.url} - ${status}: ${JSON.stringify(errorMessage)}`,
    );

    // Log the full error stack in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.error(exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: errorMessage,
    });
  }
}
