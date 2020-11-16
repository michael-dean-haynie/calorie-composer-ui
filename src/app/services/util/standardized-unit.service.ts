import { Injectable } from '@angular/core';
import convert from 'convert-units';

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
}
