import { TestBed } from '@angular/core/testing';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Unit } from 'src/app/models/unit.model';
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
      { input: 'kcal', expected: false },
      { input: 'µg', expected: false },
      { input: 'IU', expected: false },
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

  describe('stdUnitInfoFor(unitAbbr: string)', () => {
    it('should return stdUnitInfo for unit that exists in convert-units lib', () => {
      expect(() => {
        const result = service.stdUnitInfoFor('g');
        expect(result).toBeTruthy();
      }).not.toThrowError();
    });

    it('should throw error unit that does not exist in convert-units lib', () => {
      expect(() => {
        const result = service.stdUnitInfoFor('asdfasdf');
      }).toThrowError();
    });
  });

  describe('stdUnitInfoToModel', () => {
    it('should return null for falsy input', () => {
      expect(service.stdUnitInfoToModel(null)).toBeNull();
      expect(service.stdUnitInfoToModel(undefined)).toBeNull();
    });

    it('should return model', () => {
      const expected: Unit = new Unit();
      expected.abbreviation = 'g';
      expected.singular = 'Gram';
      expected.plural = 'Grams';

      const info = service.stdUnitInfoFor('g');
      const result = service.stdUnitInfoToModel(info);
      expect(result.equals(expected)).toBeTrue();
    });
  });
});
