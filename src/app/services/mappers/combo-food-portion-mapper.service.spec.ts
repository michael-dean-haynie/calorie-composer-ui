import { TestBed } from '@angular/core/testing';

import { ComboFoodPortionMapperService } from './combo-food-portion-mapper.service';

describe('ComboFoodPortionMapperService', () => {
  let service: ComboFoodPortionMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComboFoodPortionMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
