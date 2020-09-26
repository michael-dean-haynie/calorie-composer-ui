import { TestBed } from '@angular/core/testing';

import { ConversionRatioService } from './conversion-ratio.service';

describe('ConversionRatioService', () => {
  let service: ConversionRatioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionRatioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
