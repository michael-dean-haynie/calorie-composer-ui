import { TestBed } from '@angular/core/testing';

import { FdcApiService } from './fdc-api.service';

describe('FdcApiService', () => {
  let service: FdcApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FdcApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
