import { TestBed } from '@angular/core/testing';

import { ComboFoodCalculationService } from './combo-food-calculation.service';

describe('ComboFoodCalculationService', () => {
  let service: ComboFoodCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComboFoodCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
