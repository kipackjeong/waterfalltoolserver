import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Helper methods for HTTP request logging
  logRequest(method: string, url: string, ip: string, context?: string) {
    this.logger.info(`Request: ${method} ${url} - IP: ${ip}`, { context });
  }

  logResponse(method: string, url: string, status: number, duration: number, context?: string) {
    this.logger.info(`Response: ${method} ${url} - Status: ${status} - Duration: ${duration}ms`, { context });
  }
}
