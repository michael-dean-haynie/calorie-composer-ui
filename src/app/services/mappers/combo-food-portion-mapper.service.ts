import { Injectable } from '@angular/core';
import { ComboFoodPortionDTO } from 'src/app/contracts/combo-food-portion-dto';
import { ComboFoodPortion } from 'src/app/models/combo-food-portion.model';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodPortionMapperService {

  constructor() { }

  dtoToModel(comboFoodPortionDTO: ComboFoodPortionDTO): ComboFoodPortion {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.id = comboFoodPortionDTO.id;
    comboFoodPortion.isFoodAmountRefPortion = comboFoodPortionDTO.isFoodAmountRefPortion;
    comboFoodPortion.isServingSizePortion = comboFoodPortionDTO.isServingSizePortion;
    comboFoodPortion.metricUnit = comboFoodPortionDTO.metricUnit;
    comboFoodPortion.metricAmount = comboFoodPortionDTO.metricAmount;
    comboFoodPortion.householdMeasure = comboFoodPortionDTO.householdMeasure;
    comboFoodPortion.householdUnit = comboFoodPortionDTO.householdUnit;
    comboFoodPortion.householdAmount = comboFoodPortionDTO.householdAmount;
    return comboFoodPortion;
  }

  modelToDTO(comboFoodPortion: ComboFoodPortion): ComboFoodPortionDTO {
    return comboFoodPortion;
  }
}
