import { TestBed } from '@angular/core/testing';

import { ComboFoodFoodAmountMapperService } from './combo-food-food-amount-mapper.service';

describe('ComboFoodFoodAmountMapperService', () => {
  let service: ComboFoodFoodAmountMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComboFoodFoodAmountMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
