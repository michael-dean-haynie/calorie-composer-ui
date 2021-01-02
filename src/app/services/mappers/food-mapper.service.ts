import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PathResults } from 'src/app/constants/types/path-results.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { Unit } from 'src/app/models/unit.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { UnitMapperService } from '../api/unit-mapper.service';
import { NewConversionRatioService } from '../new-conversion-ratio.service';
import { NutrientValidatorService } from '../validators/nutrient-validator.service';
import { ConversionRatioMapperService } from './conversion-ratio-mapper.service';
import { NutrientMapperService } from './nutrient-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodMapperService {

  constructor(
    private nutrientMapperService: NutrientMapperService,
    private conversionRatioMapperService: ConversionRatioMapperService,
    private unitMapperService: UnitMapperService,
    private nutrientValidatorService: NutrientValidatorService,
    private unitPipe: UnitPipe,
    private newConversionRatioService: NewConversionRatioService,
    private fb: FormBuilder) { }

  dtoToModel(foodDTO: FoodDTO): Food {
    const food = new Food();
    food.id = foodDTO.id;
    food.fdcId = foodDTO.fdcId;
    food.description = foodDTO.description;
    food.brandOwner = foodDTO.brandOwner;
    food.ingredients = foodDTO.ingredients;
    food.ssrDisplayUnit = this.unitMapperService.dtoToModel(foodDTO.ssrDisplayUnit);
    food.csrDisplayUnit = this.unitMapperService.dtoToModel(foodDTO.csrDisplayUnit);
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
    // TODO: not needed maybe?
    if (!food.ssrDisplayUnit) {
      food.ssrDisplayUnit = new Unit();
    }
    if (!food.csrDisplayUnit) {
      food.csrDisplayUnit = new Unit();
    }

    const result = this.fb.group({
      id: [food.id],
      fdcId: [food.fdcId],
      description: [food.description, Validators.required],
      brandOwner: [food.brandOwner],
      ingredients: [food.ingredients],
      ssrDisplayUnit: this.unitMapperService.modelToFormGroup(food.ssrDisplayUnit),
      csrDisplayUnit: this.unitMapperService.modelToFormGroup(food.csrDisplayUnit),
      nutrients: this.fb.array(food.nutrients.map(nutrient => this.nutrientMapperService.modelToFormGroup(nutrient)),
        {
          validators: [
            this.nutrientValidatorService.noDuplicateNutrients
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

    return result;
  }

  formGroupToModel(formGroup: FormGroup): Food {
    const food = new Food();
    food.id = formGroup.get('id').value;
    food.fdcId = formGroup.get('fdcId').value;
    food.description = formGroup.get('description').value;
    food.brandOwner = formGroup.get('brandOwner').value;
    food.ingredients = formGroup.get('ingredients').value;
    food.ssrDisplayUnit = this.unitMapperService.formGroupToModel(formGroup.get('ssrDisplayUnit') as FormGroup);
    food.csrDisplayUnit = this.unitMapperService.formGroupToModel(formGroup.get('csrDisplayUnit') as FormGroup);
    food.nutrients = this.nutrientMapperService.formArrayToModelArray(formGroup.get('nutrients') as FormArray);
    food.conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(formGroup.get('conversionRatios') as FormArray);

    return food;
  }

  /**
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  private noConversionRatiosWithFreeFormValues: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const freeFormValuesExist = this.conversionRatioMapperService.formArrayToModelArray(control)
      .some(cvRat => this.newConversionRatioService.usesFreeFormValue(cvRat));

    if (freeFormValuesExist) {
      return { noConversionRatiosWithFreeFormValues: 'Unit conversions need to be entered properly.' };
    }
    return null;
  }

  //  can not have more than one conversion ratio going from mass to volume
  //     or the like for any 2 measures
  //     take into account "built up" or "indirect" conversion ratios: i.e. 32 g = 1 serving size = 1 serving size = 2 Tbsp
  //                                                                        32 g = 2 Tbsp
  //                                                                        mass -> volume
  private noContradictingOtherConversionRatios: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.newConversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.newConversionRatioService.isFilledOut(cvRat));

    const results: PathResults = this.newConversionRatioService.getAllPathsRecursive(conversionRatios, null, null, null);
    if (results.contradictions.length) {
      return { noContradictingOtherConversionRatios: results.contradictions };
    }

    return null;
  }

  private servingSizeAndConstituentsSizeMustExist: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.newConversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.newConversionRatioService.isFilledOut(cvRat));

    const allUnits = this.newConversionRatioService.getAllUnits(cvRats);

    if (!allUnits.find(unit => unit.abbreviation === RefUnit.SERVING)) {
      return { servingSizeAndConstituentsSizeMustExist: 'Serving size must be defined.' };
    }
    if (!allUnits.find(unit => unit.abbreviation === RefUnit.CONSTITUENTS)) {
      return { servingSizeAndConstituentsSizeMustExist: 'Nutrient ref amt must be defined.' };
    }
    return null;
  }

  private constituentsSizeMustBeConvertableToAllOtherDefinedUnits: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.newConversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.newConversionRatioService.isFilledOut(cvRat));

    const constituentsUnit = new Unit();
    constituentsUnit.abbreviation = RefUnit.CONSTITUENTS;

    const allUnits = this.newConversionRatioService.getAllUnits(cvRats).filter(unit => !unit.matches(constituentsUnit));
    const constituentPaths = this.newConversionRatioService.getPathsForUnit(cvRats, constituentsUnit);
    const unitsWithoutConstituentPath = allUnits.filter(unit => {
      return !constituentPaths.find(cp => this.newConversionRatioService.getPathTarget(cp).matches(unit));
    });

    if (unitsWithoutConstituentPath.length) {
      // TODO: add back in
      // const ppUnit = this.unitPipe.transform(unitsWithoutConstituentPath[0], 'nutrient');
      // return { constituentsSizeMustBeConvertableToAllOtherDefinedUnits: `${ppUnit} must be convertable to the nutrient ref amt` };
      const unit = unitsWithoutConstituentPath[0].abbreviation;
      return { constituentsSizeMustBeConvertableToAllOtherDefinedUnits: `${unit} must be convertable to the nutrient ref amt` };
    }
    return null;
  }

  private mustHaveANonRefUnit: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const cvRats = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.newConversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.newConversionRatioService.isFilledOut(cvRat));

    const allUnits = this.newConversionRatioService.getAllUnits(cvRats)
      .filter(unit => unit.abbreviation !== RefUnit.CONSTITUENTS && unit.abbreviation !== RefUnit.SERVING);

    if (allUnits.length < 1) {
      return { constituentsSizeMustBeConvertableToAllOtherDefinedUnits: `Must specify at least 1 unit besides serving size and nutrient ref amt` };
    }
    return null;
  }
}
