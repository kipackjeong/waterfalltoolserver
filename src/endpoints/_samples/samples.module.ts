import { Module } from '@nestjs/common';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { FirebaseModule } from '../../providers/firebase/firebase.module';
import { LoggerModule } from '../../utils/logger/logger.module';

@Module({
  imports: [FirebaseModule, LoggerModule],
  controllers: [SamplesController],
  providers: [SamplesService],
  exports: [SamplesService],
})
export class SamplesModule { }
