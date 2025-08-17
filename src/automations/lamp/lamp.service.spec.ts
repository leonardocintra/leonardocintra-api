import { Test, TestingModule } from '@nestjs/testing';
import { LampService } from './lamp.service';

describe('LampService', () => {
  let service: LampService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LampService],
    }).compile();

    service = module.get<LampService>(LampService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
