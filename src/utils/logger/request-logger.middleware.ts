import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) { }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const context = 'HTTP';
    const startTime = Date.now();

    // Log request
    this.loggerService.logRequest(method, originalUrl, ip!, context);

    // Log response after completion
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      this.loggerService.logResponse(method, originalUrl, statusCode, duration, context);
    });

    next();
  }
}
