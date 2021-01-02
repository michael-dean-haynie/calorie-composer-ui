import { TestBed } from '@angular/core/testing';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { ReferenceUnitService } from './reference-unit.service';


describe('ReferenceUnitService', () => {
  let service: ReferenceUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferenceUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('matchesReferenceUnit(unitAbbr: string)', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const testCases: TestCase[] = [
      { input: 'g', expected: false },
      { input: 'ml', expected: false },
      { input: 'box', expected: false },
      { input: 'cracker', expected: false },
      { input: RefUnit.SERVING, expected: true },
      { input: RefUnit.CONSTITUENTS, expected: true },
      { input: 'kcal', expected: false },
      { input: 'µg', expected: false },
      { input: 'IU', expected: false },
      { input: null, expected: false },
      { input: undefined, expected: false },
      { input: '', expected: false },
    ];

    testCases.forEach(tc => {
      it(`should return ${tc.expected} for ${tc.input}`, () => {
        expect(service.matchesReferenceUnit(tc.input)).toBe(tc.expected);
      });
    });
  });
});
