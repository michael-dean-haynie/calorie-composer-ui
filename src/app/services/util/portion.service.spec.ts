import { TestBed } from '@angular/core/testing';

import { PortionService } from './portion.service';

describe('PortionService', () => {
  let service: PortionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
