import { TestBed } from '@angular/core/testing';

import { PortionMapperService } from './portion-mapper.service';

describe('PortionMapperService', () => {
  let service: PortionMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortionMapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
