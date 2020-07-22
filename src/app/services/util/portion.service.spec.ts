import { UnitScalar } from 'src/app/constants/types/unit-scalar.type';
import { DefaultMocks } from 'src/app/default-mocks.spec';
import { PortionService } from './portion.service';
import { UnitService } from './unit.service';


fdescribe('PortionService', () => {
  let unitService: UnitService;
  let service: PortionService;

  beforeEach(() => {
    unitService = jasmine.createSpyObj(['getUnitTypeOrCustom']);
    service = new PortionService(unitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('unitScalarsOfPortion', () => {
    it('should return an empty array if portion defines neither household measure nor metric measure', () => {
      const portion = DefaultMocks.CommonPortion();
      portion.metricUnit = null;
      portion.householdUnit = null;

      expect(service.unitScalarsOfPortion(portion)).toEqual([]);
    });

    it('should return array with unitScalar for metric measure defined on portion', () => {
      const portion = DefaultMocks.CommonPortion();
      portion.householdUnit = null;

      const expected = [{ unit: portion.metricUnit, scalar: portion.metricScalar }];
      expect(service.unitScalarsOfPortion(portion)).toEqual(expected);
    });

    it('should return array with unitScalar for household measure defined on portion', () => {
      const portion = DefaultMocks.CommonPortion();
      portion.metricUnit = null;

      const expected = [{ unit: portion.householdUnit, scalar: portion.householdScalar }];
      expect(service.unitScalarsOfPortion(portion)).toEqual(expected);
    });

    it('should return array with unitScalars for both household and metric measures defined on portion', () => {
      const portion = DefaultMocks.CommonPortion();

      const expected = [
        { unit: portion.householdUnit, scalar: portion.householdScalar },
        { unit: portion.metricUnit, scalar: portion.metricScalar }
      ];
      expect(service.unitScalarsOfPortion(portion)).toEqual(expected);
    });
  });

  describe('unitScalarsAreCompatable', () => {
    it('should return false if unit types are not the same', () => {
      unitService.getUnitTypeOrCustom = jasmine.createSpy().and.returnValues('mass', 'volume');
      const us1 = DefaultMocks.UnitScalar();
      const us2 = DefaultMocks.UnitScalar();

      expect(service.unitScalarsAreCompatable(us1, us2)).toBeFalse();
    });

    it('should return true if unit types are the same and not custom', () => {
      unitService.getUnitTypeOrCustom = jasmine.createSpy().and.returnValues('mass', 'mass');
      const us1 = DefaultMocks.UnitScalar();
      const us2 = DefaultMocks.UnitScalar();

      expect(service.unitScalarsAreCompatable(us1, us2)).toBeTrue();
    });

    it('should return false if unit types are both custom but not an exact match', () => {
      unitService.getUnitTypeOrCustom = jasmine.createSpy().and.returnValues('custom', 'custom');
      const us1 = DefaultMocks.UnitScalar();
      us1.unit = 'drips';
      const us2 = DefaultMocks.UnitScalar();
      us2.unit = 'drops';

      expect(service.unitScalarsAreCompatable(us1, us2)).toBeFalse();
    });

    it('should return true if unit types are both custom and an exact match', () => {
      unitService.getUnitTypeOrCustom = jasmine.createSpy().and.returnValues('custom', 'custom');
      const us1 = DefaultMocks.UnitScalar();
      us1.unit = 'drips';
      const us2 = DefaultMocks.UnitScalar();
      us2.unit = 'drips';

      expect(service.unitScalarsAreCompatable(us1, us2)).toBeTrue();
    });
  });

  describe('portionsAreConvertable', () => {
    it('should return false if all combinations of unit scalars are incompatible', () => {
      const portion1 = DefaultMocks.CommonPortion();
      const portion2 = DefaultMocks.CommonPortion();
      service.unitScalarsAreCompatable = jasmine.createSpy().and.returnValue(false);

      expect(service.portionsAreConvertable(portion1, portion2)).toBeFalse();
    });

    it('should return true if all combinations of unit scalars are compatible', () => {
      const portion1 = DefaultMocks.CommonPortion();
      const portion2 = DefaultMocks.CommonPortion();
      service.unitScalarsAreCompatable = jasmine.createSpy().and.returnValue(true);

      expect(service.portionsAreConvertable(portion1, portion2)).toBeTrue();
    });

    it('should return true if any combination of unit scalars is compatible', () => {
      const portion1 = DefaultMocks.CommonPortion();
      const portion2 = DefaultMocks.CommonPortion();

      // stub out derrived unitscalars with id-like units for fake impl of unitScalarsAreCompatable to use
      const unitScalarsForPortion1 = [
        { unit: 'p1us1', scalar: 1 },
        { unit: 'p1us2', scalar: 1 },
      ];
      const unitScalarsForPortion2 = [
        { unit: 'p2us1', scalar: 1 },
        { unit: 'p2us2', scalar: 1 },
      ];
      service.unitScalarsOfPortion = jasmine.createSpy().and.returnValues(
        unitScalarsForPortion1,
        unitScalarsForPortion2
      );

      // check id-like value set in unit value. Make only 1 combinations pass.
      service.unitScalarsAreCompatable = jasmine.createSpy().and.callFake((us1: UnitScalar, us2: UnitScalar) => {
        let result = false;
        console.log(`comparing ${us1.unit} and ${us2.unit}`);
        if (us1.unit === 'p1us2' && us2.unit === 'p2us2') {
          result = true;
        }
        console.log(`result: ${result}`);
        return result;
      });

      expect(service.portionsAreConvertable(portion1, portion2)).toBeTrue();
    });
  });
});
