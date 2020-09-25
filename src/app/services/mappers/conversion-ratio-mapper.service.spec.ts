import { TestBed } from '@angular/core/testing';

import { ConversionRatioMapperService } from './conversion-ratio-mapper.service';

describe('ConversionRatioMapperService', () => {
  let service: ConversionRatioMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversionRatioMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
