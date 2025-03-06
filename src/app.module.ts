import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './providers/firebase/firebase.module';
import { UsersModule } from './endpoints/users/users.module';
import { LoggerModule } from './utils/logger/logger.module';
import { RequestLoggerMiddleware } from './utils/logger/request-logger.middleware';
import { LoggerService } from './utils/logger/logger.service';
import { AuthModule } from './endpoints/auth/auth.module';
import { FirebaseAuthMiddleware } from './providers/firebase/firebase.middleware';
import { ProjectsModule } from './endpoints/projects/projects.module';
import { SamplesModule } from './endpoints/_samples/samples.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    FirebaseModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    SamplesModule,
  ],
  controllers: [AppController],
  providers: [LoggerService, AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the request logger middleware to all routes
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply the Firebase auth middleware to all routes except auth login and register
    consumer
      .apply(FirebaseAuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
      )
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        { path: 'users/*', method: RequestMethod.ALL },
        { path: 'samples', method: RequestMethod.ALL },
        { path: 'samples/*', method: RequestMethod.ALL },
        { path: 'auth/verify-token', method: RequestMethod.POST },
      );
  }
}
