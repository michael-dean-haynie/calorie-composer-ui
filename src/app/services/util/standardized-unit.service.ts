import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { StdUnitInfo } from 'src/app/constants/types/std-unit-info';
import { Unit } from 'src/app/models/unit.model';

/**
 * Service providing business logic methods concerning standardized units.
 * Standardized units in this app refer to existing units such as those in the imperial or metcric systems.
 * They do not include custom units users create (such as 'box', 'bunch').
 * Nor app specific "reference-units" such as serving size or constituents size
 */
@Injectable({
  providedIn: 'root'
})
export class StandardizedUnitService {

  CONVERT = convert;

  // List of all standardized units that may be in a conversion ratio on a food
  standardizedFoodAmountUnits: StdUnitInfo[];

  constructor() {
    this.standardizedFoodAmountUnits = [
      // Mass
      this.stdUnitInfoFor('mg'),
      this.stdUnitInfoFor('g'),
      this.stdUnitInfoFor('kg'),
      this.stdUnitInfoFor('oz'),
      this.stdUnitInfoFor('lb'),
      // Volume
      this.stdUnitInfoFor('ml'),
      this.stdUnitInfoFor('l'),
      this.stdUnitInfoFor('tsp'),
      this.stdUnitInfoFor('Tbs'),
      this.stdUnitInfoFor('fl-oz'),
      this.stdUnitInfoFor('cup'),
      this.stdUnitInfoFor('pnt'),
      this.stdUnitInfoFor('qt'),
      this.stdUnitInfoFor('gal')
    ];
  }

  /**
   * Determines if a unit abbreviation matches a standardized unit
   * @param unitAbbr the unit abbreviation
   */
  matchesStandardizedUnit(unitAbbr: string): boolean {
    try {
      convert().describe(unitAbbr);
    }
    catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Determines if 2 units (by abbreviation) have a standardized conversion.
   */
  unitsHaveStandardizedConversion(unitA: string, unitB: string): boolean {
    try {
      convert(1).from(unitA).to(unitB);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  /**
   * Return StdUnitInfo matching for a unit abbreviation.
   */
  stdUnitInfoFor(unitAbbr: string): StdUnitInfo {
    try {
      return convert().describe(unitAbbr) as StdUnitInfo;
    } catch (e) {
      throw new Error(`Could not find standardized unit info for '${unitAbbr}'`);
    }
  }

  /**
   * Convert a StdUnitInfo into a Unit model
   */
  stdUnitInfoToModel(info: StdUnitInfo): Unit {
    if (!info) {
      return null;
    }

    const result: Unit = new Unit();
    result.abbreviation = info.abbr;
    result.singular = info.singular;
    result.plural = info.plural;
    return result;
  }

  /**
   * Convert a unit abbreviation into a Model, or throw error;
   */
  abbrToModel(unitAbbr: string): Unit {
    return this.stdUnitInfoToModel(this.stdUnitInfoFor(unitAbbr));
  }



}
