import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { ConstituentType } from 'src/app/constants/types/constituent-type.type';
import { MeasureType } from 'src/app/constants/types/measure-type.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { StdUnitInfo } from 'src/app/constants/types/std-unit-info';
import { Unit } from 'src/app/models/unit.model';
// import Qty from 'js-quantities';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  public static CONVERT = convert;

  /**
   * Supplemental Units
   */
  public static SupplementalUnits: StdUnitInfo[] = [
    {
      abbr: 'kcal',
      measure: 'energy',
      system: 'metric',
      singular: 'Kilocalorie',
      plural: 'Kilocalories'
    },
    {
      abbr: 'µg',
      measure: 'mass',
      system: 'metric',
      singular: 'Microgram',
      plural: 'Micrograms'
    },
    {
      abbr: 'IU',
      measure: 'biological',
      system: null,
      singular: 'International Unit',
      plural: 'International Units'
    },
    {
      abbr: RefUnit.SERVING,
      measure: 'reference',
      system: null,
      singular: null,
      plural: null
    },
    {
      abbr: RefUnit.CONSTITUENTS,
      measure: 'reference',
      system: null,
      singular: null,
      plural: null
    },
  ];

  /**
   * Metric Units
   */

  public static MetricMassUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr)) as StdUnitInfo[];

  public static MetricVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l'].includes(desc.abbr)) as StdUnitInfo[];

  public static MetricUnits = UnitService.MetricMassUnits
    .concat(UnitService.MetricVolumeUnits);

  /**
   * Imperial Units
   */

  public static ImperialMassUnits = convert()
    .list('mass').filter(desc => ['oz', 'lb'].includes(desc.abbr)) as StdUnitInfo[];

  public static ImperialVolumeUnits = convert()
    .list('volume').filter(desc => ['tsp', 'Tbs', 'fl-oz', 'cup', 'pnt', 'qt', 'gal'].includes(desc.abbr)) as StdUnitInfo[];

  /**
   * Reference Measure Units
   */

  public static ReferenceMeasureUnits = UnitService.SupplementalUnits.filter(desc => desc.measure === 'reference');
  public static ServingSizeRefUnit = UnitService.SupplementalUnits.find(desc => desc.abbr === RefUnit.SERVING);
  public static ConstituentsSizeRefUnit = UnitService.SupplementalUnits.find(desc => desc.abbr === RefUnit.CONSTITUENTS);

  /**
   * Nutrient Units
   */

  public static NutrientUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr))
    .concat(UnitService.SupplementalUnits
      .filter(desc => ['kcal', 'µg', 'IU'].includes(desc.abbr))
    ) as StdUnitInfo[];

  /**
   * Food Amount Units
   * The standardized units that I've decided to use in this app
   */

  public static FoodAmountMassUnits = convert()
    .list('mass').filter(desc => ['mg', 'g', 'kg', 'oz', 'lb'].includes(desc.abbr)) as StdUnitInfo[];

  public static FoodAmountVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l', 'tsp', 'Tbs', 'fl-oz', 'cup', 'pnt', 'qt', 'gal'].includes(desc.abbr)) as StdUnitInfo[];

  public static GetFoodAmountUnitsByMeasure = (measure: MeasureType) => {
    if (measure === 'mass') {
      return UnitService.FoodAmountMassUnits;
    }
    if (measure === 'volume') {
      return UnitService.FoodAmountVolumeUnits;
    }
    return [];
  }

  constructor() { }

  isStandardizedUnit(unit: Unit): boolean {
    try {
      convert().describe(unit.abbreviation);
      return UnitService.FoodAmountMassUnits.concat(UnitService.FoodAmountVolumeUnits)
        .map(desc => desc.abbr)
        .includes(unit.abbreviation);
    }
    catch (e) {
      return false;
    }
  }

  unitsHaveStandardizedConversion(unitA: string, unitB: string): boolean {
    try {
      convert(1).from(unitA).to(unitB);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  getMeasureType(unit: Unit): MeasureType {
    if (!unit || !unit.abbreviation) {
      console.warn(`Could not determine known measure type for unit: ${unit}`);
      return null;
    }
    try {
      return convert().describe(unit.abbreviation).measure;
    } catch (e) {
      const supplementalUnit = UnitService.SupplementalUnits.find(desc => desc.abbr === unit.abbreviation);
      if (supplementalUnit) {
        return supplementalUnit.measure;
      }
      else {
        return 'custom';
      }
    }
  }

  getStandardizedConversions(unit: Unit): Unit[] {
    if (this.isStandardizedUnit(unit)) {
      const measureType = this.getMeasureType(unit);
      return UnitService.GetFoodAmountUnitsByMeasure(measureType).map(desc => {
        const convUnit = new Unit();
        convUnit.abbreviation = desc.abbr;
        convUnit.singular = desc.singular;
        convUnit.plural = desc.plural;
        return convUnit;
      });
    }
    return [];
  }

  ppReferenceUnit(refUnit: string, constituentType: ConstituentType): string {
    const map = new Map<string, string>([
      [RefUnit.SERVING, 'serving size'],
      [RefUnit.CONSTITUENTS, constituentType === 'nutrient' ? 'nutrient ref amt' : 'ingredient ref amt']
    ]);
    return map.get(refUnit);
  }
}
