import { Injectable } from '@angular/core';
import { ReferenceUnitService } from './reference-unit.service';
import { StandardizedUnitService } from './standardized-unit.service';

@Injectable({
  providedIn: 'root'
})
export class UnitFacadeService {

  /**
   * A simplified interface to handle business logic involving the disparrate types of "units"
   */
  constructor(
    private standardizedUnitService: StandardizedUnitService,
    private referenceUnitService: ReferenceUnitService
  ) { }


  isUserManagedUnit(unitAbbr: string): boolean {

    // standardized units should not be manageable by users
    if (this.standardizedUnitService.matchesStandardizedUnit(unitAbbr)) {
      return false;
    }

    // reference units should not be manageable by users
    if (this.referenceUnitService.matchesReferenceUnit(unitAbbr)) {
      return false;
    }

    return true;

  }
}
