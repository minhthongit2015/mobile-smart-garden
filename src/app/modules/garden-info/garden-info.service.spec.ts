import { TestBed } from '@angular/core/testing';

import { GardenInfoService } from './garden-info.service';

describe('GardenInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GardenInfoService = TestBed.get(GardenInfoService);
    expect(service).toBeTruthy();
  });
});
