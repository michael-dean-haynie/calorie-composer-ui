import { Injectable } from '@angular/core';
import { HouseholdMeasureMode } from 'src/app/constants/types/household-measure-mode.type';
import { Portion } from 'src/app/models/portion.model';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class PortionService {

  constructor() { }

  getServingSize(portions: Portion[]): Portion {
    if (!portions) { return undefined; }
    return portions.find(portion => portion.isServingSizePortion);
  }

  getNonSSPortions(portions: Portion[]): Portion[] {
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

  determineHouseholdMeasureMode(portion: Portion): HouseholdMeasureMode {
    const empty = val => val === undefined || val === null || ('' + val).trim() === '';
    let result: HouseholdMeasureMode = 'unit-amount';

    if (!empty(portion.householdMeasure) && (empty(portion.householdUnit) || empty(portion.householdAmount))) {
      result = 'free-form';
    }

    return result;

  }
}
