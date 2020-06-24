import { Injectable } from '@angular/core';
import { HouseholdMeasureMode } from 'src/app/constants/types/household-measure-mode.type';
import { Portion } from 'src/app/models/portion.model';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class PortionService {

  constructor() {
    // console.log(convert().measures());
    // console.log(convert().measures().map(measure => convert().possibilities(measure)));
    // console.log(convert().describe('kg'));

    // console.log(Qty.getUnits('mass'));
    // console.log(Qty.getUnits('volume'));

    // let qty = Qty(1, 'ml');
    // console.log(Qty.getAliases('ml'));
    // console.log(qty);
    // console.log(qty.kind());
    // console.log(Qty.getAliases('g'));

    // qty = Qty(1, 'ml');
    // console.log(qty);
    // console.log(qty.kind());

    // Qty.getKinds().forEach(kind => Qty.getUnits(kind).forEach(unit => console.log(unit)));
    // console.log(Qty.getKinds().);
    // console.log(Qty.getUnits('unitless'));
  }

  getServingSize(portions: Portion[]): Portion {
    if (!portions) { return undefined; }
    return portions.find(portion => portion.isServingSizePortion);
  }

  getNonSSPortions(portions: Portion[]): Portion[] {
    if (!portions) { return []; }
    return portions.filter(portion => !portion.isServingSizePortion);
  }

  determineBaseUnit(baseUnitName: string): string {
    return UnitService.MetricMeasureUnits.find(unitDesc => {
      return [
        unitDesc.abbr,
        unitDesc.singular.toLowerCase(),
        unitDesc.plural.toLowerCase()
      ].includes(baseUnitName);
    })?.abbr || baseUnitName;
  }

  determineHouseholdMeasureMode(portion: Portion): HouseholdMeasureMode {
    const empty = val => val === undefined || val === null || ('' + val).trim() === '';
    let result: HouseholdMeasureMode = 'unit-amount';

    if (!empty(portion.description) && (empty(portion.displayUnitName) || empty(portion.displayUnitAmount))) {
      result = 'free-form';
    }

    return result;

  }
}
