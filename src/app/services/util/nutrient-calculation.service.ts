import { Injectable } from '@angular/core';
import { CalsPerMacro } from 'src/app/constants/cals-per-macro';
import { SumReducer } from 'src/app/constants/functions';
import { MacroNutrientType, MacroNutrientTypes } from 'src/app/constants/types/macro-nutrient.type';
import { NutrientType } from 'src/app/constants/types/nutrient.type';
import { Food } from 'src/app/models/food.model';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class NutrientCalculationService {

  constructor(
    private unitService: UnitService
  ) { }

  /**
   * Returns the concrete amount of a NutrientType in a Food.
   * The amount is per 1 nutrient-reference-portion.
   * Only returns the scalar (no unit). The implied unit is what's defined on the Nutrient in the Food.
   *
   * @param food the food
   * @param nutrientType the nutrient to calculate the amount of
   * @returns scalar amount of the nutrient in the Food.
   *  Returns 0 if Food does not specify a value for the nutrient.
   */
  nutrientAmtInFood(food: Food, nutrientType: NutrientType): number {
    const nutrient = food.nutrients.find(nutr => nutr.name === nutrientType);
    return nutrient ? nutrient.amount : 0;
  }

  /**
   * Calculates the concrete amount of kcals in a Food for a MacroNutrientType
   * The amount is per 1 nutrient-reference-portion.
   *
   * @param food the food
   * @param macro the macronutrient to calculate the kcals for
   * @returns the kcals in the food for this particular macronutrient
   */
  calsInFoodForMacro(food: Food, macro: MacroNutrientType): number {
    return this.nutrientAmtInFood(food, macro) * CalsPerMacro.get(macro);
  }

  /**
   * Calculates the percentage of kcals in a Food for a MacroNutrientType
   *
   * @param food the food
   * @param macro the macronutrient for which to calculate the kcal percentage
   * @returns the percentage of kcals in the food from the macronutrient
   */
  pctgCalsInFoodForMacro(food: Food, macro: MacroNutrientType): number {
    const totalCalsFromMacros = MacroNutrientTypes
      .map(macroNutrient => this.calsInFoodForMacro(food, macroNutrient))
      .reduce(SumReducer);

    return (this.calsInFoodForMacro(food, macro) / totalCalsFromMacros) * 100;
  }

}
