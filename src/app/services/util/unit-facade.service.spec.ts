import { TestBed } from '@angular/core/testing';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { UnitFacadeService } from './unit-facade.service';


describe('UnitFacadeService', () => {
  let service: UnitFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isUserManagedUnit(unitAbbr: string)', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const testCases: TestCase[] = [
      { input: 'g', expected: false },
      { input: 'ml', expected: false },
      { input: 'box', expected: true },
      { input: 'cracker', expected: true },
      { input: RefUnit.SERVING, expected: false },
      { input: RefUnit.CONSTITUENTS, expected: false },
      { input: 'kcal', expected: false },
      { input: 'µg', expected: false },
      { input: 'IU', expected: false }
      // undecided for now
      // { input: null, expected: false },
      // { input: undefined, expected: false },
      // { input: '', expected: false },
    ];

    testCases.forEach(tc => {
      it(`should return ${tc.expected} for ${tc.input}`, () => {
        expect(service.isUserManagedUnit(tc.input)).toBe(tc.expected);
      });
    });
  });
});
