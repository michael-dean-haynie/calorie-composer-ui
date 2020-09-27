import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { ConstituentType } from 'src/app/constants/types/constituent-type.type';
import { MeasureType } from 'src/app/constants/types/measure-type.type';
import { UnitDescription } from 'src/app/constants/types/unit-description';
import { Food } from 'src/app/models/food.model';
// import Qty from 'js-quantities';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  /**
   * Supplemental Units
   */
  public static SupplementalUnits: UnitDescription[] = [
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
      abbr: 'SERVING_SIZE_REF',
      measure: 'reference',
      system: null,
      singular: null,
      plural: null
    },
    {
      abbr: 'CONSTITUENTS_SIZE_REF',
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
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr)) as UnitDescription[];

  public static MetricVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l'].includes(desc.abbr)) as UnitDescription[];

  public static MetricUnits = UnitService.MetricMassUnits
    .concat(UnitService.MetricVolumeUnits);

  /**
   * Imperial Units
   */

  public static ImperialMassUnits = convert()
    .list('mass').filter(desc => ['oz', 'lb'].includes(desc.abbr)) as UnitDescription[];

  public static ImperialVolumeUnits = convert()
    .list('volume').filter(desc => ['tsp', 'Tbs', 'fl-oz', 'cup', 'pnt', 'qt', 'gal'].includes(desc.abbr)) as UnitDescription[];

  /**
   * Reference Measure Units
   */

  public static ReferenceMeasureUnits = UnitService.SupplementalUnits.filter(desc => desc.measure === 'reference');
  public static ServingSizeRefUnit = UnitService.SupplementalUnits.find(desc => desc.abbr === 'SERVING_SIZE_REF');
  public static ConstituentsSizeRefUnit = UnitService.SupplementalUnits.find(desc => desc.abbr === 'CONSTITUENTS_SIZE_REF');

  /**
   * Nutrient Units
   */

  public static NutrientUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr))
    .concat(UnitService.SupplementalUnits
      .filter(desc => ['kcal', 'µg', 'IU'].includes(desc.abbr))
    ) as UnitDescription[];

  /**
   * Food Amount Units
   */

  public static FoodAmountMassUnits = convert()
    .list('mass').filter(desc => ['mg', 'g', 'kg', 'oz', 'lb'].includes(desc.abbr)) as UnitDescription[];

  public static FoodAmountVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l', 'tsp', 'Tbs', 'fl-oz', 'cup', 'pnt', 'qt', 'gal'].includes(desc.abbr)) as UnitDescription[];

  constructor() { }

  getMeasureType(unit: string): MeasureType {
    if (!unit) { return null; }
    let result: MeasureType;
    try {
      result = convert().describe(unit).measure;
    } catch (e) {
      console.warn(`Could not determine known measure type for unit: ${unit}`);
      result = null;
    }
    return result;
  }

  ppReferenceUnit(refUnit: string, constituentType: ConstituentType): string {
    const map = new Map<string, string>([
      ['SERVING_SIZE_REF', 'serving size'],
      ['CONSTITUENTS_SIZE_REF', constituentType === 'nutrient' ? 'nutrient ref amt' : 'ingredient ref amt']
    ]);
    return map.get(refUnit);
  }

  mapUnitToAutoCompleteOptions(unit: UnitDescription, constituentType: ConstituentType): any {
    const isReferenceUnit = UnitService.ReferenceMeasureUnits.some(desc => desc.abbr === unit.abbr);
    if (isReferenceUnit) {
      return {
        label: this.ppReferenceUnit(unit.abbr, constituentType),
        value: unit.abbr
      };
    }

    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

  // TODO: come up with flow to parse free form units
  // TODO: maybe have some indicator that there are more units to use if user can parse it out

  // Gets all the units that can be used to describe a concrete amount of a particular food
  getUnitsForFood(food: Food) {
    let result: UnitDescription[] = [];

    // TODO: Refactor with conversion ratio implementation
    // // mass
    // const includeMass = food.conversionRatios.some(portion => this.getUnitType(portion.metricUnit) === 'mass');
    // if (includeMass) {
    //   result = result.concat(UnitService.FoodAmountMassUnits);
    // }

    // // volume
    // const includeVolume = food.conversionRatios.some(portion => this.getUnitType(portion.metricUnit) === 'volume');
    // if (includeVolume) {
    //   result = result.concat(UnitService.FoodAmountVolumeUnits);
    // }

    // // other
    // const otherUnits = food.conversionRatios
    //   .filter(portion => portion.householdUnit)
    //   .map(portion => portion.householdUnit);

    // otherUnits.forEach(unit => {
    //   const unitDescription: UnitDescription = {
    //     abbr: null,
    //     measure: null,
    //     system: null,
    //     singular: null,
    //     plural: unit,
    //   };
    //   result.push(unitDescription);
    // });

    return result;
  }
}
