import { TestBed } from '@angular/core/testing';

import { NutrientMetadataService } from './nutrient-metadata.service';

describe('NutrientMetadataService', () => {
  let service: NutrientMetadataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutrientMetadataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
