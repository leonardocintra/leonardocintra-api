import { Test, TestingModule } from '@nestjs/testing';
import { LampController } from './lamp.controller';
import { LampService } from './lamp.service';

describe('LampController', () => {
  let controller: LampController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LampController],
      providers: [LampService],
    }).compile();

    controller = module.get<LampController>(LampController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
