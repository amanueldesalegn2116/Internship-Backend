import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should return health OK', () => {
    const result = controller.getHealth();
    expect(result.status).toBe('OK');
    expect(result.timestamp).toBeDefined();
  });
});
