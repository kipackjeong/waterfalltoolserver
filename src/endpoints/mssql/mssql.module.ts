import { Module } from '@nestjs/common';
import { LoggerModule } from '../../utils/logger/logger.module';
import { MssqlController } from './mssql.controller';
import { MssqlService } from './mssql.service';
import { FirebaseModule } from 'src/providers/firebase/firebase.module';

@Module({
  imports: [FirebaseModule, LoggerModule],
  controllers: [MssqlController],
  providers: [MssqlService],
  exports: [MssqlService],
})
export class MssqlsModule { }
