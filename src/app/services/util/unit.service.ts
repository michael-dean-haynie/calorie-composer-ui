import { Injectable } from '@angular/core';
import convert from 'convert-units';
// import Qty from 'js-quantities';

export type UnitMeasure = 'mass' | 'volume';
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

  public static MetricMeasureMassUnits = convert()
    .list('mass').filter(desc => ['mg', 'g'].includes(desc.abbr)) as UnitDescription[];

  public static MetricMeasureVolumeUnits = convert()
    .list('volume').filter(desc => ['ml', 'l'].includes(desc.abbr)) as UnitDescription[];

  public static MetricMeasureUnits = UnitService.MetricMeasureMassUnits.concat(UnitService.MetricMeasureVolumeUnits);

  constructor() {
    console.log(UnitService.MetricMeasureMassUnits);
    console.log(UnitService.MetricMeasureVolumeUnits);
  }
}
