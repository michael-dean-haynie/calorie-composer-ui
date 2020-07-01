import { Injectable } from '@angular/core';
import { ComboFoodDTO } from 'src/app/contracts/combo-food-dto';
import { ComboFood } from 'src/app/models/combo-food.model';
import { ComboFoodFoodAmountMapperService } from './combo-food-food-amount-mapper.service';
import { ComboFoodPortionMapperService } from './combo-food-portion-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodMapperService {

  constructor(
    private comboFoodFoodAmountMapperService: ComboFoodFoodAmountMapperService,
    private comboFoodPortionMapperService: ComboFoodPortionMapperService
  ) { }

  dtoToModel(comboFoodDTO: ComboFoodDTO): ComboFood {
    const comboFood = new ComboFood();
    comboFood.id = comboFoodDTO.id;
    comboFood.isDraft = comboFoodDTO.isDraft;
    comboFood.description = comboFoodDTO.description;
    comboFood.foodAmounts = comboFoodDTO.foodAmounts.map(foodAmountDTO => this.comboFoodFoodAmountMapperService.dtoToModel(foodAmountDTO));
    comboFood.portions = comboFoodDTO.portions.map(portionDTO => this.comboFoodPortionMapperService.dtoToModel(portionDTO));
    return comboFood;
  }

  modelToDTO(comboFood: ComboFood): ComboFoodDTO {
    return comboFood;
  }
}
