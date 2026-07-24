import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health should return 200', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('OK');
      });
  });

  it('GET /api/applicants without auth should return 401', () => {
    return request(app.getHttpServer())
      .get('/api/applicants')
      .expect(401);
  });

  it('POST /api/auth/login with invalid creds returns 401', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' })
      .expect(401);
  });

  it('POST /api/auth/login with missing email returns 400', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ password: 'Admin@1234' })
      .expect(400);
  });
});
