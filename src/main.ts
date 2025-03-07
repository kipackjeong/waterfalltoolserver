import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as path from 'path';
import * as fs from 'fs';
import { decryptAndLoadEnv } from './utils/env-crypto';

async function bootstrap() {
  // Try to load from encrypted .env file in production
  const envEncryptedPath = path.join(__dirname, '/env.encrypted');
  if (fs.existsSync(envEncryptedPath)) {
    decryptAndLoadEnv(envEncryptedPath);
  } else {
    throw new Error('Missing encrypted .env file at ' + envEncryptedPath);
  }

  const app = await NestFactory.create(AppModule);
  // Use winston logger
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  // Enable CORS with more permissive settings for local development
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('WaterfallTool API')
    .setDescription('The WaterfallTool API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter Firebase JWT token',
        in: 'header',
      },
      'firebase-jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Set up Swagger with improved options
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // This code will be executed in the browser
        req.credentials = 'include';
        return req;
      },
    },
    customSiteTitle: 'WaterfallTool API Documentation',
  });

  // Start the server
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger UI available at: http://localhost:${port}/api`);
}

bootstrap();
