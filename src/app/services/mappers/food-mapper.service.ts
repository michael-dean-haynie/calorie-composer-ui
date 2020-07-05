import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { PortionService } from '../util/portion.service';
import { UnitService } from '../util/unit.service';
import { NutrientMapperService } from './nutrient-mapper.service';
import { PortionMapperService } from './portion-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodMapperService {

  constructor(
    private nutrientMapperService: NutrientMapperService,
    private portionMapperService: PortionMapperService,
    private portionService: PortionService,
    private unitService: UnitService,
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
    food.portions = foodDTO.portions
      .map(portionDTO => this.portionMapperService.dtoToModel(portionDTO));

    return food;
  }

  modelToDTO(food: Food): FoodDTO {
    return food;
  }

  modelToFormGroup(food: Food): FormGroup {
    // extract serving size portion
    const ssp = this.portionService.getServingSize(food.portions) ?? this.portionMapperService.defaultSSModel();
    const otherPortions = this.portionService.getNonSSPortions(food.portions);

    return this.fb.group({
      id: [food.id],
      fdcId: [food.fdcId],
      description: [food.description, Validators.required],
      brandOwner: [food.brandOwner],
      ingredients: [food.ingredients],
      nutrients: this.fb.array(food.nutrients.map(nutrient => this.nutrientMapperService.modelToFormGroup(nutrient))),
      servingSizePortion: this.portionMapperService.modelToFormGroup(ssp),
      otherPortions: this.fb.array(otherPortions.map(portion => this.portionMapperService.modelToFormGroup(portion)))
    }, { validators: [this.exactlyOneNutrientRefPortionPerUnitType] });
  }

  formGroupToModel(formGroup: FormGroup): Food {
    const food = new Food();
    food.id = formGroup.get('id').value;
    food.fdcId = formGroup.get('fdcId').value;
    food.description = formGroup.get('description').value;
    food.brandOwner = formGroup.get('brandOwner').value;
    food.ingredients = formGroup.get('ingredients').value;
    food.nutrients = this.nutrientMapperService.formArrayToModelArray(formGroup.get('nutrients') as FormArray);

    // collect portions
    food.portions = [];
    food.portions.push(this.portionMapperService.formGroupToModel(formGroup.get('servingSizePortion') as FormGroup));
    food.portions = food.portions.concat(this.portionMapperService.formArrayToModelArray(formGroup.get('otherPortions') as FormArray));

    return food;
  }

  // Must have exactly 1 nutrient reference portion per unit type (mass/volume) that there are portions of
  private exactlyOneNutrientRefPortionPerUnitType: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const servingSizePortion = control.get('servingSizePortion') as FormControl;
    const otherPortions = control.get('otherPortions') as FormArray;
    const allPortions = [servingSizePortion].concat(otherPortions.controls as FormControl[]);

    const allUnitTypes = allPortions
      // map to unit type and remove falsey results
      .map(portion => this.unitService.getUnitType(portion.get('metricUnit')?.value))
      .filter(measure => measure);

    // remove duplicates
    const uniqueUnitTypes = new Set(allUnitTypes);

    // check for number of nutrient reference portions per unit type and return error if not 1
    for (const unitType of uniqueUnitTypes) {
      const refPortionsOfUnitType = allPortions
        .filter(portion => portion.get('isNutrientRefPortion').value)
        .filter(portion => this.unitService.getUnitType(portion.get('metricUnit')?.value) === unitType);

      if (refPortionsOfUnitType.length !== 1) {
        return { exactlyOneNutrientRefPortionPerUnitType: true };
      }
    }

    return null;
  }

}
