import { Injectable } from '@angular/core';
import { Unit } from 'src/app/models/unit.model';
/**
 * Service providing business logic methods concerning supplemental units.
 * Supplemental units in this app refer to real worl units - like standardized units, but
 * ones that aren't available in the convert-units library. They "supplement" the available standardized units.
 */

@Injectable({
  providedIn: 'root'
})
export class SupplementalUnitService {

  supplementalUnits: Unit[];

  constructor() {
    this.supplementalUnits = [];

    const kcal = new Unit();
    kcal.singular = 'Kilocalorie';
    kcal.plural = 'KiloCalories';
    kcal.abbreviation = 'kcal';

    const µg = new Unit();
    µg.singular = 'Microgram';
    µg.plural = 'Micrograms';
    µg.abbreviation = 'µg';

    const IU = new Unit();
    IU.singular = 'International Unit';
    IU.plural = 'International Unit';
    IU.abbreviation = 'IU';

    this.supplementalUnits = [kcal, µg, IU];
  }

  matchesSupplementalUnit(unitAbbr: string) {
    return this.supplementalUnits
      .map(sup => sup.abbreviation).includes(unitAbbr);
  }

  abbrToModel(unitAbbr: string): Unit {
    const result = this.supplementalUnits.find(sup => sup.abbreviation === unitAbbr);

    if (!unitAbbr || !result) {
      throw new Error(`Could not resolve supplemental unit for '${unitAbbr}'`);
    }

    return result;
  }
}
