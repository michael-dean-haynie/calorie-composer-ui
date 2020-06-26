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

  // Must have at least one portion flagged as a nutrient reference portion
  private nutrientRefPortionRequired: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const servingSizePortion = control.get('servingSizePortion') as FormControl;
    const otherPortions = control.get('otherPortions') as FormArray;
    const allPortions = [servingSizePortion].concat(otherPortions.controls as FormControl[]);

    return allPortions.some(portion => !!portion.get('isNutrientRefPortion').value) ? null : { nutrientRefPortionRequired: true };
  }

  // No more than one nutrient reference portion per unit type (mass / volume)
  private oneNutrientRefPortionPerUnitType: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const servingSizePortion = control.get('servingSizePortion') as FormControl;
    const otherPortions = control.get('otherPortions') as FormArray;
    const allPortions = [servingSizePortion].concat(otherPortions.controls as FormControl[]);

    const allMeasures = allPortions
      // only concerned about portions marked as nutrient ref portion
      .filter(portion => portion.get('isNutrientRefPortion').value)
      // map to unit type and remove falsey results
      .map(portion => this.unitService.getUnitMeasure(portion.get('baseUnitName').value))
      .filter(measure => measure);

    // check for duplicates and return error if existing
    return (new Set(allMeasures).size === allMeasures.length)
      ? null
      : { oneNutrientRefPortionPerUnitType: true };

  }

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
      description: [food.description, Validators.required],
      brandOwner: [food.brandOwner],
      ingredients: [food.ingredients],
      nutrients: this.fb.array(food.nutrients.map(nutrient => {
        return this.nutrientMapperService.modelToFormGroup(nutrient);
      })),
      servingSizePortion: this.portionMapperService.modelToFormGroup(ssp),
      otherPortions: this.fb.array(otherPortions.map(portion => this.portionMapperService.modelToFormGroup(portion)))
    }, { validators: [this.nutrientRefPortionRequired, this.oneNutrientRefPortionPerUnitType] });
  }

}
