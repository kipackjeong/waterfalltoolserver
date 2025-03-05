import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { FirebaseModule } from '../../providers/firebase/firebase.module';
import { LoggerModule } from '../../utils/logger/logger.module';

@Module({
  imports: [FirebaseModule, LoggerModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule { }
