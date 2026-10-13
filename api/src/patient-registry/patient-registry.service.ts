import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Patient {
  cpf: string;
  name: string;
}

// Shape of the JSON returned by the external service (fields are in Portuguese).
interface RegistryPatientResponse {
  cpf: string;
  nome: string;
  dataNascimento: string;
}

const REQUEST_TIMEOUT_MS = 3000;

// Client for the external patient registry (mock-service).
// It is the only place in the API that knows the registry URL and its format.
@Injectable()
export class PatientRegistryService {
  private readonly logger = new Logger(PatientRegistryService.name);
  private readonly baseUrl: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>(
      'PATIENT_REGISTRY_URL',
      'http://localhost:4000',
    );
  }

  async findByCpf(cpf: string): Promise<Patient> {
    const response = await this.request(`/pacientes/${cpf}`);

    if (response.status === 404) {
      throw new NotFoundException('Paciente não encontrado no cadastro.');
    }

    if (!response.ok) {
      this.logger.error(`Registry answered with status ${response.status}`);
      throw this.unavailable();
    }

    const body = (await response.json()) as RegistryPatientResponse;
    return { cpf: body.cpf, name: body.nome };
  }

  private async request(path: string): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      // Network failure or timeout: the registry could not be reached.
      this.logger.error(`Could not reach the registry: ${String(error)}`);
      throw this.unavailable();
    }
  }

  private unavailable() {
    return new ServiceUnavailableException(
      'Serviço de cadastro indisponível. Tente novamente em instantes.',
    );
  }
}
