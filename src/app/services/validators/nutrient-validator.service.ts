import { Injectable } from '@angular/core';
import { FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { NutrientMapperService } from '../mappers/nutrient-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class NutrientValidatorService {

  constructor(
    private nutrientMapperService: NutrientMapperService
  ) { }


  noDuplicateNutrients: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const nutrients = this.nutrientMapperService.formArrayToModelArray(control).filter(nutrient => {
      // nutrient must be filled out
      return IsMeaningfulValue(nutrient.name)
        && IsMeaningfulValue(nutrient.amount)
        && nutrient.unit // is not null or undefined
        && IsMeaningfulValue(nutrient.unit.abbreviation);
    });

    const duplicateNutrient = nutrients.find(nutrient => {
      const name = nutrient.name;
      return nutrients.filter(nutr => nutr.name === name).length > 1;
    });

    if (duplicateNutrient) {
      return { noDuplicateNutrients: `Detected duplicate entries for nutrient: "${duplicateNutrient.name}"` };
    }
    return null;
  }
}
