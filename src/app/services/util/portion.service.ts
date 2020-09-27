import { Injectable } from '@angular/core';
import { CommonPortion } from 'src/app/constants/types/common-portion.type';
import { HouseholdMeasureMode } from 'src/app/constants/types/household-measure-mode.type';
import { UnitScalar } from 'src/app/constants/types/unit-scalar.type';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class PortionService {

  constructor(
    private unitService: UnitService
  ) { }

  fieldIsEmpty(fieldVal): boolean {
    return fieldVal === undefined || fieldVal === null || ('' + fieldVal).trim() === '';
  }

  getServingSize<T extends CommonPortion>(portions: T[]): T {
    if (!portions) { return undefined; }
    return portions.find(portion => portion.isServingSizePortion);
  }

  getNonSSPortions<T extends CommonPortion>(portions: T[]): T[] {
    if (!portions) { return []; }
    return portions.filter(portion => !portion.isServingSizePortion);
  }

  determineMetricUnit(unitName: string): string {
    return UnitService.MetricUnits.find(unitDesc => {
      return [
        unitDesc.abbr,
        unitDesc.singular.toLowerCase(),
        unitDesc.plural.toLowerCase()
      ].includes(unitName);
    })?.abbr || unitName;
  }

  determineHouseholdMeasureMode<T extends CommonPortion>(portion: T): HouseholdMeasureMode {
    let result: HouseholdMeasureMode = 'unit-scalar';

    if (!this.fieldIsEmpty(portion.householdMeasure)
      && (this.fieldIsEmpty(portion.householdUnit) || this.fieldIsEmpty(portion.householdScalar))) {
      result = 'free-form';
    }

    return result;

  }

  portionsAreConvertable(p1: CommonPortion, p2: CommonPortion): boolean {
    const p1UnitScalars = this.unitScalarsOfPortion(p1);
    const p2unitScalars = this.unitScalarsOfPortion(p2);

    return p1UnitScalars.some(
      p1us => p2unitScalars.some(
        p2us => this.unitScalarsAreCompatable(p1us, p2us)
      ));
  }

  unitScalarsAreCompatable(us1: UnitScalar, us2: UnitScalar): boolean {
    // const us1Type = this.unitService.getUnitTypeOrCustom(us1.unit);
    // const us2Type = this.unitService.getUnitTypeOrCustom(us2.unit);

    // if (us1Type !== us2Type) {
    //   return false;
    // }
    // // if they are custom they must also be exact match (e.g. 'pieces' === 'pieces')
    // else if (us1Type === 'custom' && (us1.unit !== us2.unit)) {
    //   return false;
    // }

    return true;
  }

  unitScalarsOfPortion(portion: CommonPortion): UnitScalar[] {
    const unitScalars = [];

    if (!this.fieldIsEmpty(portion.householdUnit)) {
      unitScalars.push({ unit: portion.householdUnit, scalar: portion.householdScalar });
    }

    if (!this.fieldIsEmpty(portion.metricUnit)) {
      unitScalars.push({ unit: portion.metricUnit, scalar: portion.metricScalar });
    }

    return unitScalars;
  }




}
