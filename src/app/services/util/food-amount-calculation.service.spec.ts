import { TestBed } from '@angular/core/testing';

import { FoodAmountCalculationService } from './food-amount-calculation.service';

describe('FoodAmountCalculationService', () => {
  let service: FoodAmountCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodAmountCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
