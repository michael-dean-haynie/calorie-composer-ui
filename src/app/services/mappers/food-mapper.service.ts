import { Injectable } from '@angular/core';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { NutrientMapperService } from './nutrient-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodMapperService {

  constructor(private nutrientMapperService: NutrientMapperService) { }

  dtoToModel(foodDTO: FoodDTO): Food {
    const food = new Food();
    food.fdcId = foodDTO.fdcId;
    food.description = foodDTO.description;
    food.brandOwner = foodDTO.brandOwner;
    food.ingredients = foodDTO.ingredients;
    food.servingSize = foodDTO.servingSize;
    food.servingSizeUnit = foodDTO.servingSizeUnit;
    food.nutrients = foodDTO.nutrients
      .map(nutrientDTO => this.nutrientMapperService.dtoToModel(nutrientDTO));

    return food;
  }
}
