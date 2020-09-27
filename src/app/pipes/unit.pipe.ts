import { Pipe, PipeTransform } from '@angular/core';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { UnitService } from '../services/util/unit.service';

@Pipe({
  name: 'unit'
})
export class UnitPipe implements PipeTransform {

  constructor(private unitService: UnitService) { }

  transform(value: string, constituentType?: ConstituentType): string {
    let result = value;


    const matchingReferenceUnit = UnitService.ReferenceMeasureUnits.find(desc => desc.abbr === value);
    if (matchingReferenceUnit) {
      result = this.unitService.ppReferenceUnit(matchingReferenceUnit.abbr, constituentType);
    }

    return result;
  }

}
