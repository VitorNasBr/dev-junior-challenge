import { Injectable } from '@nestjs/common';
import { Checkin } from '@prisma/client';
import { PatientRegistryService } from '../patient-registry/patient-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { maskCpf } from './utils/mask-cpf';

// What the API returns for a check-in. The CPF never leaves the API unmasked.
export interface CheckinResponse {
  id: number;
  cpf: string;
  name: string;
  arrivedAt: Date;
}

@Injectable()
export class CheckinsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientRegistry: PatientRegistryService,
  ) {}

  async create(cpf: string): Promise<CheckinResponse> {
    // Throws 404 if the CPF is not registered, so nothing is saved in that case.
    const patient = await this.patientRegistry.findByCpf(cpf);

    const checkin = await this.prisma.checkin.create({
      data: { cpf, name: patient.name },
    });

    return this.toResponse(checkin);
  }

  async findTodayQueue(): Promise<CheckinResponse[]> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const checkins = await this.prisma.checkin.findMany({
      where: { arrivedAt: { gte: startOfToday } },
      orderBy: { arrivedAt: 'asc' },
    });

    return checkins.map((checkin) => this.toResponse(checkin));
  }

  private toResponse(checkin: Checkin): CheckinResponse {
    return {
      id: checkin.id,
      cpf: maskCpf(checkin.cpf),
      name: checkin.name,
      arrivedAt: checkin.arrivedAt,
    };
  }
}
