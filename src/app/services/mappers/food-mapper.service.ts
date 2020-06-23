import { Injectable } from '@angular/core';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { NutrientMapperService } from './nutrient-mapper.service';
import { PortionMapperService } from './portion-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodMapperService {

  constructor(private nutrientMapperService: NutrientMapperService, private portionMapperService: PortionMapperService) { }

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

}
