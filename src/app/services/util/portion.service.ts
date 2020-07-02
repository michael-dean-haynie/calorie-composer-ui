import { Injectable } from '@angular/core';
import { HouseholdMeasureMode } from 'src/app/constants/types/household-measure-mode.type';
import { UnitService } from './unit.service';

// Could be a Portion or a ComboFoodPortion
interface CommonPortion {
  id?: string;
  isServingSizePortion: boolean;
  metricUnit?: string;
  metricAmount?: number;
  householdMeasure?: string;
  householdUnit?: string;
  householdAmount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortionService {

  constructor() { }

  getServingSize<T extends CommonPortion>(portions: T[]): T {
    if (!portions) { return undefined; }
    return portions.find(portion => portion.isServingSizePortion);
  }

  getNonSSPortions<T extends CommonPortion>(portions: T[]): T[] {
    if (!portions) { return []; }
    return portions.filter(portion => !portion.isServingSizePortion);
  }

  determineMetricUnit(unitName: string): string {
    return UnitService.MetricMeasureUnits.find(unitDesc => {
      return [
        unitDesc.abbr,
        unitDesc.singular.toLowerCase(),
        unitDesc.plural.toLowerCase()
      ].includes(unitName);
    })?.abbr || unitName;
  }

  determineHouseholdMeasureMode<T extends CommonPortion>(portion: T): HouseholdMeasureMode {
    const empty = val => val === undefined || val === null || ('' + val).trim() === '';
    let result: HouseholdMeasureMode = 'unit-amount';

    if (!empty(portion.householdMeasure) && (empty(portion.householdUnit) || empty(portion.householdAmount))) {
      result = 'free-form';
    }

    return result;

  }
}
