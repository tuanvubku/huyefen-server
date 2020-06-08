import { Test, TestingModule } from '@nestjs/testing';
import { CloudController } from './cloud.controller';

describe('Cloud Controller', () => {
  let controller: CloudController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudController],
    }).compile();

    controller = module.get<CloudController>(CloudController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
