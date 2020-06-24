import { TestBed } from '@angular/core/testing';

import { FoodValidatorService } from './food-validator.service';

describe('FoodValidatorService', () => {
  let service: FoodValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
