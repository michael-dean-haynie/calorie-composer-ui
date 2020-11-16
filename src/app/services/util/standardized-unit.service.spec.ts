import { TestBed } from '@angular/core/testing';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { StandardizedUnitService } from './standardized-unit.service';


fdescribe('StandardizedUnitService', () => {
  let service: StandardizedUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StandardizedUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('matchesStandardizedUnit(unitAbbr: string)', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const testCases: TestCase[] = [
      { input: 'g', expected: true },
      { input: 'ml', expected: true },
      { input: 'box', expected: false },
      { input: 'cracker', expected: false },
      { input: RefUnit.SERVING, expected: false },
      { input: RefUnit.CONSTITUENTS, expected: false },
      { input: null, expected: false },
      { input: undefined, expected: false },
      { input: '', expected: false },
    ];

    testCases.forEach(tc => {
      it(`should return ${tc.expected} for ${tc.input}`, () => {
        expect(service.matchesStandardizedUnit(tc.input)).toBe(tc.expected);
      });
    });


  });
});
