import { TestBed } from '@angular/core/testing';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { SupplementalUnitService } from './supplemental-unit.service';


describe('SupplementalUnitService', () => {
  let service: SupplementalUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplementalUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('matchesSupplementalUnit(unitAbbr: string)', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const testCases: TestCase[] = [
      { input: 'g', expected: false },
      { input: 'ml', expected: false },
      { input: 'box', expected: false },
      { input: 'cracker', expected: false },
      { input: RefUnit.SERVING, expected: false },
      { input: RefUnit.CONSTITUENTS, expected: false },
      { input: 'kcal', expected: true },
      { input: 'µg', expected: true },
      { input: 'IU', expected: true },
      { input: null, expected: false },
      { input: undefined, expected: false },
      { input: '', expected: false },
    ];

    testCases.forEach(tc => {
      it(`should return ${tc.expected} for ${tc.input}`, () => {
        expect(service.matchesSupplementalUnit(tc.input)).toBe(tc.expected);
      });
    });
  });
});
