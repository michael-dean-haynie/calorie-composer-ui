import { TestBed } from '@angular/core/testing';

import { NutrientCalculationService } from './nutrient-calculation.service';

describe('NutrientCalculationService', () => {
  let service: NutrientCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutrientCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
