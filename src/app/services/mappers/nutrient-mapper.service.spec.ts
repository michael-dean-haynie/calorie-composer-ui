import { TestBed } from '@angular/core/testing';

import { NutrientMapperService } from './nutrient-mapper.service';

describe('NutrientMapperService', () => {
  let service: NutrientMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NutrientMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
