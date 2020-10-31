import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { ContradictionsResult } from 'src/app/constants/types/contradictions-result.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { ConversionRatioService } from '../conversion-ratio.service';
import { PortionService } from '../util/portion.service';
import { UnitService } from '../util/unit.service';
import { ConversionRatioMapperService } from './conversion-ratio-mapper.service';
import { NutrientMapperService } from './nutrient-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodMapperService {

  constructor(
    private nutrientMapperService: NutrientMapperService,
    private conversionRatioMapperService: ConversionRatioMapperService,
    private portionService: PortionService,
    private unitService: UnitService,
    private unitPipe: UnitPipe,
    private conversionRatioService: ConversionRatioService,
    private fb: FormBuilder) { }

  dtoToModel(foodDTO: FoodDTO): Food {
    const food = new Food();
    food.id = foodDTO.id;
    food.fdcId = foodDTO.fdcId;
    food.description = foodDTO.description;
    food.brandOwner = foodDTO.brandOwner;
    food.ingredients = foodDTO.ingredients;
    food.nutrients = foodDTO.nutrients
      .map(nutrientDTO => this.nutrientMapperService.dtoToModel(nutrientDTO));
    food.conversionRatios = foodDTO.conversionRatios
      .map(conversionRatioDTO => this.conversionRatioMapperService.dtoToModel(conversionRatioDTO));

    return food;
  }

  modelToDTO(food: Food): FoodDTO {
    return food;
  }

  modelToFormGroup(food: Food): FormGroup {


    return this.fb.group({
      id: [food.id],
      fdcId: [food.fdcId],
      description: [food.description, Validators.required],
      brandOwner: [food.brandOwner],
      ingredients: [food.ingredients],
      nutrients: this.fb.array(food.nutrients.map(nutrient => this.nutrientMapperService.modelToFormGroup(nutrient)),
        {
          validators: [
            this.noDuplicateNutrients
          ]
        }
      ),
      conversionRatios: this.fb.array(
        food.conversionRatios.map(conversionRatio => this.conversionRatioMapperService.modelToFormGroup(conversionRatio)),
        {
          validators: [
            this.noContradictingOtherConversionRatios,
            this.noConversionRatiosWithFreeFormValues,
            this.servingSizeAndConstituentsSizeMustExist,
            this.constituentsSizeMustBeConvertableToAllOtherDefinedUnits,
            this.mustHaveANonRefUnit
          ]
        }
      )
    });
  }

  formGroupToModel(formGroup: FormGroup): Food {
    const food = new Food();
    food.id = formGroup.get('id').value;
    food.fdcId = formGroup.get('fdcId').value;
    food.description = formGroup.get('description').value;
    food.brandOwner = formGroup.get('brandOwner').value;
    food.ingredients = formGroup.get('ingredients').value;
    food.nutrients = this.nutrientMapperService.formArrayToModelArray(formGroup.get('nutrients') as FormArray);
    food.conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(formGroup.get('conversionRatios') as FormArray);

    return food;
  }

  //  can not have more than one conversion ratio going from mass to volume
  //     or the like for any 2 measures
  //     take into account "built up" or "indirect" conversion ratios: i.e. 32 g = 1 serving size = 1 serving size = 2 Tbsp
  //                                                                        32 g = 2 Tbsp
  //                                                                        mass -> volume
  private noContradictingOtherConversionRatios: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));
    const error = { noContradictingOtherConversionRatios: null };

    const result: ContradictionsResult = this.conversionRatioService.checkForContradictions(conversionRatios, 'nutrient');
    if (result.contradictionsExist) {
      error.noContradictingOtherConversionRatios = result;
      return error;
    }
    return null;
  }

  private noConversionRatiosWithFreeFormValues: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const freeFormValuesExist = this.conversionRatioMapperService.formArrayToModelArray(control)
      .some(cvRat => this.conversionRatioService.usesFreeFormValue(cvRat));

    if (freeFormValuesExist) {
      return { noConversionRatiosWithFreeFormValues: 'Unit conversions need to be entered properly.' };
    }
    return null;
  }

  private servingSizeAndConstituentsSizeMustExist: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));

    const allUnits = this.conversionRatioService.getAllUnits(cvRats);

    if (!allUnits.includes(RefUnit.SERVING)) {
      return { servingSizeAndConstituentsSizeMustExist: 'Serving size must be defined.' };
    }
    if (!allUnits.includes(RefUnit.CONSTITUENTS)) {
      return { servingSizeAndConstituentsSizeMustExist: 'Nutrient ref amt must be defined.' };
    }
    return null;
  }

  private constituentsSizeMustBeConvertableToAllOtherDefinedUnits: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));

    const allUnits = this.conversionRatioService.getAllUnits(cvRats).filter(unit => unit !== RefUnit.CONSTITUENTS);
    const constituentPaths = this.conversionRatioService.getPathsForUnit(cvRats, RefUnit.CONSTITUENTS);
    const unitsWithoutConstituentPath = allUnits.filter(unit => {
      return !constituentPaths.find(cp => this.conversionRatioService.getPathTarget(cp) === unit);
    });

    if (unitsWithoutConstituentPath.length) {
      const ppUnit = this.unitPipe.transform(unitsWithoutConstituentPath[0], 'nutrient');
      return { constituentsSizeMustBeConvertableToAllOtherDefinedUnits: `${ppUnit} must be convertable to the nutrient ref amt` };
    }
    return null;
  }

  private mustHaveANonRefUnit: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));

    const allUnits = this.conversionRatioService.getAllUnits(cvRats)
      .filter(unit => unit !== RefUnit.CONSTITUENTS && unit !== RefUnit.SERVING);

    if (allUnits.length < 1) {
      return { constituentsSizeMustBeConvertableToAllOtherDefinedUnits: `Must specify at least 1 unit besides serving size and nutrient ref amt` };
    }
    return null;
  }

  private noDuplicateNutrients: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const nutrients = this.nutrientMapperService.formArrayToModelArray(control).filter(nutrient => {
      // nutrient must be filled out
      return IsMeaningfulValue(nutrient.name)
        && IsMeaningfulValue(nutrient.scalar)
        && IsMeaningfulValue(nutrient.unit);
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
