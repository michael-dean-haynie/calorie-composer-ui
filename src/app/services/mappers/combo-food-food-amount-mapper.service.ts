import { Injectable } from '@angular/core';
import { ComboFoodFoodAmountDTO } from 'src/app/contracts/combo-food-food-amount-dto';
import { ComboFoodFoodAmount } from 'src/app/models/combo-food-food-amount.model';
import { FoodMapperService } from './food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodFoodAmountMapperService {

  constructor(
    private foodMapperService: FoodMapperService
  ) { }

  dtoToModel(comboFoodFoodAmountDTO: ComboFoodFoodAmountDTO): ComboFoodFoodAmount {
    const comboFoodFoodAmount = new ComboFoodFoodAmount();
    comboFoodFoodAmount.id = comboFoodFoodAmountDTO.id;
    comboFoodFoodAmount.food = this.foodMapperService.dtoToModel(comboFoodFoodAmountDTO.food);
    comboFoodFoodAmount.metricAmount = comboFoodFoodAmountDTO.metricAmount;
    return comboFoodFoodAmount;
  }

  modelToDTO(comboFoodFoodAmount: ComboFoodFoodAmount): ComboFoodFoodAmountDTO {
    return comboFoodFoodAmount;
  }
}
