import { Pipe, PipeTransform } from '@angular/core';
import { MacroNutrientType } from '../constants/types/macro-nutrient.type';
import { Food } from '../models/food.model';
import { NutrientCalculationService } from '../services/util/nutrient-calculation.service';

@Pipe({
  name: 'macroAmt'
})
export class MacroAmtPipe implements PipeTransform {

  constructor(private nutrientCalculationService: NutrientCalculationService) { }

  transform(food: Food, macro: MacroNutrientType): number {
    return this.nutrientCalculationService.macroAmt(food, macro);
  }

}
