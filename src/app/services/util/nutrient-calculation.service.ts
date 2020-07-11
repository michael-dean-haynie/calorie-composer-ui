import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { MacroNutrientType } from 'src/app/constants/types/macro-nutrient.type';
import { PortionMeasureType } from 'src/app/constants/types/portion-measure-type.type';
import { ComboFoodFoodAmount } from 'src/app/models/combo-food-food-amount.model';
import { ComboFood } from 'src/app/models/combo-food.model';
import { Food } from 'src/app/models/food.model';
import { Portion } from 'src/app/models/portion.model';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class NutrientCalculationService {

  calsPerMacro: Map<MacroNutrientType, number> = new Map([
    ['Carbohydrate', 4],
    ['Fat', 9],
    ['Protein', 4]
  ]);

  constructor(
    private unitService: UnitService
  ) { }

  // ---------------------------------
  // Food
  // ---------------------------------

  macroAmt(food: Food, macro: MacroNutrientType): number {
    const nutrient = food.nutrients.find(nutr => nutr.name === macro);
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

  // ---------------------------------
  // ComboFoodFoodAmount
  // ---------------------------------

  foodAmtMacroAmt(foodAmount: ComboFoodFoodAmount, macro: MacroNutrientType): number {
    console.log('foodAmount.amount:', foodAmount.amount);
    console.log('foodAmount.unit:', foodAmount.unit);

    // amount in 1 nutrient ref portion of food
    const nutrientRefAmt = this.macroAmt(foodAmount.food, macro);
    console.log('nutrientRefAmt:', nutrientRefAmt);

    // determine unit type of foodAmount unit
    const foodAmountUnitType = this.unitService.getUnitType(foodAmount.unit);
    console.log('foodAmountUnitType:', foodAmountUnitType);

    // Step 1: select a portion that has the same unit type
    let intermediatePortion: Portion = null;
    let intermediatePortionMeasureType: PortionMeasureType = 'metric';
    let isCustomUnitType = false;

    // first try the metric unit of the portion
    intermediatePortion = foodAmount.food.portions
      .find(portion => this.unitService.getUnitType(portion.metricUnit) === foodAmountUnitType);
    console.log('intermediatePortion:', intermediatePortion);

    // next try the household unit of the portion (where they are recognized unit types)
    if (!intermediatePortion) {
      intermediatePortionMeasureType = 'household';
      intermediatePortion = foodAmount.food.portions
        .filter(portion => portion.householdUnit) // remove portions with falsey values for household unit
        .filter(portion => this.unitService.getUnitType(portion.householdUnit)) // restrict recognized unit types
        .find(portion => this.unitService.getUnitType(portion.householdUnit) === foodAmountUnitType);
      console.log('intermediatePortionMeasureType:', intermediatePortionMeasureType);
      console.log('intermediatePortion:', intermediatePortion);
    }

    // next try household unit that is not a recognized unit type (must be exact match)
    if (!intermediatePortion) {
      isCustomUnitType = true;
      intermediatePortion = foodAmount.food.portions
        .filter(portion => portion.householdUnit) // remove portions with falsey values for household unit
        .find(portion => portion.householdUnit === foodAmount.unit);
      console.log('isCustomUnitType:', isCustomUnitType);
      console.log('intermediatePortionMeasureType:', intermediatePortionMeasureType);
      console.log('intermediatePortion:', intermediatePortion);
    }

    if (!intermediatePortion) {
      console.error('food portions:', foodAmount.food.portions);
      console.error(`Could not find suitable portion for nutrient calculation of ComboFoodFoodAmount. foodAmmount unit: ${foodAmount.unit}, foodAmountUnitType: ${foodAmountUnitType}`);
      return;
    }

    // Step 2: select a nutrient ref portion that can map selected portions to nutrient values
    const nutrientRefPortion = foodAmount.food.portions
      .filter(portion => portion.isNutrientRefPortion)
      .find(portion => this.unitService.getUnitType(portion.metricUnit) === this.unitService.getUnitType(intermediatePortion.metricUnit));
    console.log('nutrientRefPortion:', nutrientRefPortion);

    if (!nutrientRefPortion) {
      console.error('food portions:', foodAmount.food.portions);
      console.error(`Could not find suitable nutrient ref portion for nutrient calculation of ComboFoodFoodAmount. foodAmmount unit: ${foodAmount.unit}, foodAmountUnitType: ${foodAmountUnitType}`);
      return;
    }


    // Step 3b: different approach
    const intermediatePortions = this.convertConcreteFoodAmountIntoConcreteAmountOfIntermediatePortion(
      foodAmount, intermediatePortion, intermediatePortionMeasureType, isCustomUnitType
    );
    console.log('intermediatePortions:', intermediatePortions);

    const refPortions = this.convertConcreteAmountOfIntermediatePortionsToConcreteAmountOfNutrientRefPortions(
      intermediatePortion, intermediatePortions, nutrientRefPortion
    );
    console.log('refPortions:', refPortions);

    // in units defined in nutrient model
    const macroAmt = refPortions * nutrientRefAmt;
    console.log('macroAmt:', macroAmt);

    return macroAmt;
  }

  foodAmtMacroCals(foodAmount: ComboFoodFoodAmount, macro: MacroNutrientType): number {
    return this.foodAmtMacroAmt(foodAmount, macro) * this.calsPerMacro.get(macro);
  }

  foodAmtMacroPctg(foodAmount: ComboFoodFoodAmount, comboFood: ComboFood, macro: MacroNutrientType): number {
    return (this.foodAmtMacroCals(foodAmount, macro) / this.comboFoodCalAmt(comboFood)) * 100;
  }

  foodAmtCalAmt(foodAmount: ComboFoodFoodAmount): number {
    const macros: MacroNutrientType[] = ['Fat', 'Carbohydrate', 'Protein'];

    const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

    return macros
      .map(macroNutrient => this.foodAmtMacroCals(foodAmount, macroNutrient))
      .reduce(sumReducer);
  }

  foodAmtCalPctg(foodAmount: ComboFoodFoodAmount, comboFood: ComboFood): number {
    return (this.foodAmtCalAmt(foodAmount) / this.comboFoodCalAmt(comboFood)) * 100;
  }

  // ---------------------------------
  // ComboFood
  // ---------------------------------

  comboFoodCalAmt(comboFood: ComboFood): number {
    const macros: MacroNutrientType[] = ['Fat', 'Carbohydrate', 'Protein'];

    const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

    return macros
      .map(macroNutrient => comboFood.foodAmounts.map(foodAmt => this.foodAmtMacroCals(foodAmt, macroNutrient)).reduce(sumReducer))
      .reduce(sumReducer);
  }


  private convertConcreteFoodAmountIntoConcreteAmountOfIntermediatePortion(
    foodAmount: ComboFoodFoodAmount, intermediatePortion: Portion, measureType: PortionMeasureType, isCustomUnitType: boolean
  ): number {
    if (measureType === 'metric') {
      return convert(foodAmount.amount).from(foodAmount.unit).to(intermediatePortion.metricUnit) / intermediatePortion.metricAmount;
    }
    else { // measure type is 'household'
      if (!isCustomUnitType) {
        return convert(foodAmount.amount).from(foodAmount.unit).to(intermediatePortion.householdUnit) / intermediatePortion.householdAmount;
      } else {
        return foodAmount.amount / intermediatePortion.householdAmount;
      }
    }
  }

  private convertConcreteAmountOfIntermediatePortionsToConcreteAmountOfNutrientRefPortions(
    intermediatePortion: Portion, intermediatePortions: number, nutrientRefPortion: Portion
  ): number {
    return convert(intermediatePortion.metricAmount).from(intermediatePortion.metricUnit).to(nutrientRefPortion.metricUnit)
      * intermediatePortions / nutrientRefPortion.metricAmount;
  }
}
