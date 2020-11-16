import { Injectable } from '@angular/core';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';

/**
 * Service providing business logic methods concerning reference units.
 * Reference units in this app are specifically SERVING_SIZE_REF and CONSTITUENTS_SIZE_REF
 * They are used alongside other standardized and user-manageable units to to determine various portions.
 */
@Injectable({
  providedIn: 'root'
})
export class ReferenceUnitService {

  constructor() { }

  matchesReferenceUnit(unitAbbr: string): boolean {
    return [RefUnit.SERVING, RefUnit.CONSTITUENTS].includes(unitAbbr);
  }
}
