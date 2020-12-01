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

  constructor() { }

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
