import { TestBed } from '@angular/core/testing';

import { FoodMapperService } from './food-mapper.service';

describe('FoodMapperService', () => {
  let service: FoodMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoodMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
