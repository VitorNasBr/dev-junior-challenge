import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CheckinsController } from '../src/checkins/checkins.controller';
import { CheckinsService } from '../src/checkins/checkins.service';

// Tests the HTTP layer (routes + validation) with a fake CheckinsService,
// so it runs without a database or the external service.
describe('Checkins (e2e)', () => {
  let app: INestApplication<App>;
  const checkinsService = { create: jest.fn(), findTodayQueue: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [CheckinsController],
      providers: [{ provide: CheckinsService, useValue: checkinsService }],
    }).compile();

    app = moduleRef.createNestApplication();
    // Same pipe configured in main.ts
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(() => app.close());

  it('POST /checkins removes the CPF mask before creating the check-in', async () => {
    checkinsService.create.mockResolvedValue({ id: 1 });

    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '111.111.111-11' })
      .expect(201);

    expect(checkinsService.create).toHaveBeenCalledWith('11111111111');
  });

  it('POST /checkins answers 400 when the CPF does not have 11 digits', async () => {
    await request(app.getHttpServer())
      .post('/checkins')
      .send({ cpf: '123' })
      .expect(400);

    expect(checkinsService.create).not.toHaveBeenCalled();
  });

  it('POST /checkins answers 400 when the CPF is missing', async () => {
    await request(app.getHttpServer()).post('/checkins').send({}).expect(400);
  });

  it("GET /checkins returns today's queue", async () => {
    const queue = [{ id: 1, cpf: '***.111.111-**', name: 'Ana Souza' }];
    checkinsService.findTodayQueue.mockResolvedValue(queue);

    await request(app.getHttpServer())
      .get('/checkins')
      .expect(200)
      .expect(queue);
  });
});
