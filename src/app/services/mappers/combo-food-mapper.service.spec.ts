import { TestBed } from '@angular/core/testing';

import { ComboFoodMapperService } from './combo-food-mapper.service';

describe('ComboFoodMapperService', () => {
  let service: ComboFoodMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComboFoodMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
