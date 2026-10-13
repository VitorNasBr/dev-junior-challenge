import { Module } from '@nestjs/common';
import { PatientRegistryModule } from '../patient-registry/patient-registry.module';
import { CheckinsController } from './checkins.controller';
import { CheckinsService } from './checkins.service';

@Module({
  imports: [PatientRegistryModule],
  controllers: [CheckinsController],
  providers: [CheckinsService],
})
export class CheckinsModule {}
