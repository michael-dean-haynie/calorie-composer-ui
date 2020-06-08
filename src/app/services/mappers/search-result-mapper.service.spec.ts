import { TestBed } from '@angular/core/testing';

import { SearchResultMapperService } from './search-result-mapper.service';

describe('SearchResultMapperService', () => {
  let service: SearchResultMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchResultMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
