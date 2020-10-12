import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
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
      nutrients: this.fb.array(food.nutrients.map(nutrient => this.nutrientMapperService.modelToFormGroup(nutrient))),
      conversionRatios: this.fb.array(
        food.conversionRatios.map(conversionRatio => this.conversionRatioMapperService.modelToFormGroup(conversionRatio)),
        { validators: [this.noContradictingOtherConversionRatios] }
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

  //     can not have more than one conversion ratio going from mass to volume
  //        or the like for any 2 measures
  //        take into account "built up" or "indirect" conversion ratios: i.e. 32 g = 1 serving size = 1 serving size = 2 Tbsp
  //                                                                           32 g = 2 Tbsp
  //                                                                           mass -> volume
  private noContradictingOtherConversionRatios: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));
    const error = { noContradictingOtherConversionRatios: true };

    // this.conversionRatioService.getAllPaths(conversionRatios);
    if (this.conversionRatioService.producesContradictions(conversionRatios)) {
      return error;
    }
    return null;
  }
}
