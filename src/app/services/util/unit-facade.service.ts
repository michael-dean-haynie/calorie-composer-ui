import { Injectable } from '@angular/core';
import { Unit } from 'src/app/models/unit.model';
import { ReferenceUnitService } from './reference-unit.service';
import { StandardizedUnitService } from './standardized-unit.service';
import { SupplementalUnitService } from './supplemental-unit.service';


/**
 * A simplified interface to handle business logic involving the disparrate types of "units"
 */
@Injectable({
  providedIn: 'root'
})
export class UnitFacadeService {

  nutrientUnits: Unit[];

  constructor(
    private standardizedUnitService: StandardizedUnitService,
    private supplementalUnitService: SupplementalUnitService,
    private referenceUnitService: ReferenceUnitService
  ) {
    this.nutrientUnits = [
      this.standardizedUnitService.abbrToModel('g'),
      this.standardizedUnitService.abbrToModel('mg'),
      this.supplementalUnitService.abbrToModel('kcal'),
      this.supplementalUnitService.abbrToModel('µg'),
      this.supplementalUnitService.abbrToModel('IU')
    ];
  }


  isUserManagedUnit(unitAbbr: string): boolean {

    // standardized units should not be manageable by users
    if (this.standardizedUnitService.matchesStandardizedUnit(unitAbbr)) {
      return false;
    }

    // supplemental units should not be manageable by users
    if (this.supplementalUnitService.matchesSupplementalUnit(unitAbbr)) {
      return false;
    }

    // reference units should not be manageable by users
    if (this.referenceUnitService.matchesReferenceUnit(unitAbbr)) {
      return false;
    }

    return true;
  }

  matchesNutrientUnit(unitAbbr: string): boolean {
    return this.nutrientUnits
      .map(nut => nut.abbreviation).includes(unitAbbr);
  }




}
