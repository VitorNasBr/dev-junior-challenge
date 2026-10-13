import {
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PatientRegistryService } from './patient-registry.service';

describe('PatientRegistryService', () => {
  let service: PatientRegistryService;
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    const config = new ConfigService({
      PATIENT_REGISTRY_URL: 'http://registry.test',
    });
    service = new PatientRegistryService(config);

    // Replaces the global fetch so no real HTTP request is made.
    fetchMock = jest.spyOn(global, 'fetch');
    // Keeps the expected error logs out of the test output.
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns the patient translated to our format', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        cpf: '11111111111',
        nome: 'Ana Souza',
        dataNascimento: '1988-03-12',
      }),
    );

    const patient = await service.findByCpf('11111111111');

    expect(patient).toEqual({ cpf: '11111111111', name: 'Ana Souza' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://registry.test/pacientes/11111111111',
      expect.anything(),
    );
  });

  it('throws NotFoundException when the registry answers 404', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ erro: 'Paciente não encontrado' }, { status: 404 }),
    );

    await expect(service.findByCpf('99999999999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ServiceUnavailableException when the registry answers 500', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(service.findByCpf('11111111111')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws ServiceUnavailableException when the registry is unreachable', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(service.findByCpf('11111111111')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
