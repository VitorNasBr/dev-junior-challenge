import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PatientRegistryService } from '../patient-registry/patient-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { CheckinsService } from './checkins.service';

describe('CheckinsService', () => {
  let service: CheckinsService;

  // Fakes: the tests never touch the real database or the external service.
  const prisma = {
    checkin: { create: jest.fn(), findMany: jest.fn() },
  };
  const patientRegistry = { findByCpf: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckinsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PatientRegistryService, useValue: patientRegistry },
      ],
    }).compile();

    service = moduleRef.get(CheckinsService);
  });

  describe('create', () => {
    it('saves the check-in with the name returned by the registry', async () => {
      const arrivedAt = new Date('2026-01-10T12:00:00Z');
      patientRegistry.findByCpf.mockResolvedValue({
        cpf: '11111111111',
        name: 'Ana Souza',
      });
      prisma.checkin.create.mockResolvedValue({
        id: 1,
        cpf: '11111111111',
        name: 'Ana Souza',
        arrivedAt,
      });

      const result = await service.create('11111111111');

      expect(patientRegistry.findByCpf).toHaveBeenCalledWith('11111111111');
      expect(prisma.checkin.create).toHaveBeenCalledWith({
        data: { cpf: '11111111111', name: 'Ana Souza' },
      });
      expect(result).toEqual({
        id: 1,
        cpf: '***.111.111-**',
        name: 'Ana Souza',
        arrivedAt,
      });
    });

    it('does not save anything when the patient is not found', async () => {
      patientRegistry.findByCpf.mockRejectedValue(new NotFoundException());

      await expect(service.create('99999999999')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.checkin.create).not.toHaveBeenCalled();
    });
  });

  describe('findTodayQueue', () => {
    it('asks only for check-ins of today, oldest first', async () => {
      prisma.checkin.findMany.mockResolvedValue([]);

      await service.findTodayQueue();

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      expect(prisma.checkin.findMany).toHaveBeenCalledWith({
        where: { arrivedAt: { gte: startOfToday } },
        orderBy: { arrivedAt: 'asc' },
      });
    });

    it('returns the queue with masked CPFs', async () => {
      const arrivedAt = new Date();
      prisma.checkin.findMany.mockResolvedValue([
        { id: 1, cpf: '11111111111', name: 'Ana Souza', arrivedAt },
        { id: 2, cpf: '22222222222', name: 'Bruno Carvalho', arrivedAt },
      ]);

      const queue = await service.findTodayQueue();

      expect(queue).toEqual([
        { id: 1, cpf: '***.111.111-**', name: 'Ana Souza', arrivedAt },
        { id: 2, cpf: '***.222.222-**', name: 'Bruno Carvalho', arrivedAt },
      ]);
    });
  });
});
