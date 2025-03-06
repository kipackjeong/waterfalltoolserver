import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../../providers/firebase/firebase.module';
import { UsersService } from '../users/users.service';
import { LoggerModule } from '../../utils/logger/logger.module';
import { LoggerService } from 'src/utils/logger/logger.service';

@Module({
  imports: [FirebaseModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LoggerService],
  exports: [AuthService],
})
export class AuthModule { }
