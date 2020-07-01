import { TestBed } from '@angular/core/testing';

import { ComboFoodApiService } from './combo-food-api.service';

describe('ComboFoodApiService', () => {
  let service: ComboFoodApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComboFoodApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
