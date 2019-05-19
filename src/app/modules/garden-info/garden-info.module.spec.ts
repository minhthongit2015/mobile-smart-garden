import { GardenInfoModule } from './garden-info.module';

describe('GardenInfoModule', () => {
  let gardenInfoModule: GardenInfoModule;

  beforeEach(() => {
    gardenInfoModule = new GardenInfoModule();
  });

  it('should create an instance', () => {
    expect(gardenInfoModule).toBeTruthy();
  });
});
