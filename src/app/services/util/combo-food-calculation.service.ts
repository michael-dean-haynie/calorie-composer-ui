import { Injectable } from '@angular/core';
import { SumReducer } from 'src/app/constants/functions';
import { MacroNutrientType } from 'src/app/constants/types/macro-nutrient.type';
import { ComboFood } from 'src/app/models/combo-food.model';
import { FoodAmount } from 'src/app/models/food-amount';
import { FoodAmountCalculationService } from './food-amount-calculation.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodCalculationService {

  constructor(
    private foodAmountCalc: FoodAmountCalculationService
  ) { }

  /**
   * Calculates the total kcals in a ComboFood
   * The amount is per 1 food-amount-reference-portion.
   *
   * @param comboFood the combo food
   * @returns the total amount of kcals in this combo food
   */
  calsInComboFood(comboFood: ComboFood): number {
    return comboFood.foodAmounts
      .filter(foodAmount => this.foodAmountCalc.foodAmountIsCalculable(foodAmount))
      .map(foodAmount => this.foodAmountCalc.calsInFoodAmount(foodAmount))
      .reduce(SumReducer);
  }

  /**
   * Calculates the percentage of total kcals in a ComboFood that a FoodAmount contributes for a particular MacroNutrientType.
   *
   * @param foodAmount the food amount
   * @param comboFood the combo food with the total kcals
   * @param macro the macronutrient to calculate the percentage of
   */
  pctgOfComboFoodCalsInFoodAmountForMacro(foodAmount: FoodAmount, comboFood: ComboFood, macro: MacroNutrientType): number {
    return (this.foodAmountCalc.calsInFoodAmountForMacro(foodAmount, macro) / this.calsInComboFood(comboFood)) * 100;
  }

  /**
   * Calculates the percentage of total kcals in a Combo food that a FoodAmount's total kcals contribute
   *
   * @param foodAmount the food amount to calculate the percentage of
   * @param comboFood the combo food with the total kcals
   */
  pctgOfComboFoodCalsInFoodAmount(foodAmount: FoodAmount, comboFood: ComboFood): number {
    return (this.foodAmountCalc.calsInFoodAmount(foodAmount) / this.calsInComboFood(comboFood)) * 100;
  }
}
