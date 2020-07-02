import { Injectable } from '@angular/core';
import convert from 'convert-units';
// import Qty from 'js-quantities';

export type UnitMeasure = 'mass' | 'volume' | 'energy' | 'biological';
export type UnitSystem = 'metric' | 'imperial';
export interface UnitDescription {
  abbr: string;
  measure: UnitMeasure;
  system: UnitSystem;
  singular: string;
  plural: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  // Supplemental Units
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
  ];

  // Metric Measure Units
  public static MetricMeasureMassUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr)) as UnitDescription[];

  public static MetricMeasureVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l'].includes(desc.abbr)) as UnitDescription[];

  public static MetricMeasureUnits = UnitService.MetricMeasureMassUnits
    .concat(UnitService.MetricMeasureVolumeUnits);

  // Nutrient Units
  public static NutrientUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr))
    .concat(UnitService.SupplementalUnits) as UnitDescription[];


  constructor() { }

  getUnitMeasure(unit: string): UnitMeasure {
    if (!unit) { return null; }
    return convert().describe(unit)?.measure;
  }
}
