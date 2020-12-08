import { TestBed } from '@angular/core/testing';

import { NutrientValidatorService } from './nutrient-validator.service';

describe('NutrientValidatorService', () => {
  let service: NutrientValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutrientValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
