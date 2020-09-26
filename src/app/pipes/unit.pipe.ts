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
      // Serving Size
      if (matchingReferenceUnit.abbr === UnitService.ServingSizeRefUnit.abbr) {
        result = 'serving size';
      }

      // Constituents Size
      if (matchingReferenceUnit.abbr === UnitService.ConstituentsSizeRefUnit.abbr) {
        if (constituentType === 'nutrient') {
          result = 'nutrient ref amt';
        }
        else if (constituentType === 'food') {
          result = 'ingredient ref amt';
        }
      }
    }

    return result;
  }

}
