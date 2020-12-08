import { TestBed } from '@angular/core/testing';

import { ConversionRatioValidatorService } from './conversion-ratio-validator.service';

describe('ConversionRatioValidatorService', () => {
  let service: ConversionRatioValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionRatioValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
