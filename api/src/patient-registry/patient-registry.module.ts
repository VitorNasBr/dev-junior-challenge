import { Module } from '@nestjs/common';
import { PatientRegistryService } from './patient-registry.service';

@Module({
  providers: [PatientRegistryService],
  exports: [PatientRegistryService],
})
export class PatientRegistryModule {}
