import { Injectable } from '@angular/core';
import { MacroNutrientType } from 'src/app/constants/types/macro-nutrient.type';
import { Food } from 'src/app/models/food.model';

@Injectable({
  providedIn: 'root'
})
export class NutrientCalculationService {

  calsPerMacro: Map<MacroNutrientType, number> = new Map([
    ['Carbohydrate', 4],
    ['Fat', 9],
    ['Protein', 4]
  ]);

  constructor() { }

  macroAmt(food: Food, macro: MacroNutrientType): number {
    const nutrient = food.nutrients.find(nutr => nutr.nutrient === macro);
    return nutrient ? nutrient.amount : 0;
  }

  macroCals(food: Food, macro: MacroNutrientType): number {
    return this.macroAmt(food, macro) * this.calsPerMacro.get(macro);
  }

  macroPctg(food: Food, macro: MacroNutrientType): number {

    const macros: MacroNutrientType[] = ['Fat', 'Carbohydrate', 'Protein'];

    const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

    const totalCalsFromMacros = macros
      .map(macroNutrient => this.macroCals(food, macroNutrient))
      .reduce(sumReducer);

    return (this.macroCals(food, macro) / totalCalsFromMacros) * 100;
  }
}
