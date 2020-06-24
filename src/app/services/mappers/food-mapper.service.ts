import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { PortionService } from '../util/portion.service';
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
      otherPortions: otherPortions.map(portion => this.portionMapperService.modelToFormGroup(portion))
    });
  }
}
