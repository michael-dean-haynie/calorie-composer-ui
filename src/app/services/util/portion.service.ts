import { Injectable } from '@angular/core';
// import convert from 'convert-units';
import Qty from 'js-quantities';
import { HouseholdMeasureMode } from 'src/app/constants/types/household-measure-mode.type';
import { BaseUnitType, MassUnit, MassUnits, VolumeUnit, VolumeUnits } from 'src/app/constants/types/units.type';
import { Portion } from 'src/app/models/portion.model';

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
    return portions.find(portion => portion.isServingSizePortion);
  }

  getNonSSPortions(portions: Portion[]): Portion[] {
    return portions.filter(portion => !portion.isServingSizePortion);
  }

  determineBaseUnitType(baseUnitName: string): BaseUnitType {
    const qty = Qty(1, baseUnitName);
    if (qty.kind() === 'mass') {
      return 'mass';
    } else if (qty.kind() === 'volume') {
      return 'volume';
    } else {
      return null;
    }
  }

  determineBaseUnit(baseUnitName: string): MassUnit | VolumeUnit {
    const units: (MassUnit | VolumeUnit)[] = this.determineBaseUnitType(baseUnitName) === 'mass' ? MassUnits : VolumeUnits;
    return units.find(unit => Qty.getAliases(baseUnitName).includes(unit));
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
