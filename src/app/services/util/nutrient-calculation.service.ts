import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { CalsPerMacro } from 'src/app/constants/cals-per-macro';
import { SumReducer } from 'src/app/constants/functions';
import { MacroNutrientType, MacroNutrientTypes } from 'src/app/constants/types/macro-nutrient.type';
import { NutrientType } from 'src/app/constants/types/nutrient.type';
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

  constructor(
    private unitService: UnitService
  ) { }

  // ---------------------------------
  // Food
  // ---------------------------------

  /**
   * Returns the concrete amount of a NutrientType in a Food.
   * The amount is per 1 nutrient-reference-portion.
   * Only returns the scalar (no unit). The implied unit is what's defined on the Nutrient in the Food.
   * 
   * @param food the food
   * @param nutrientType the nutrient type to calculate the amount of
   * @returns scalar amount of the nutrient in the Food.
   *  Returns 0 if Food does not specify a value for the nutrient.
   */
  nutrientAmtInFood(food: Food, nutrientType: NutrientType): number {
    const nutrient = food.nutrients.find(nutr => nutr.name === nutrientType);
    return nutrient ? nutrient.scalar : 0;
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

  // ---------------------------------
  // ComboFoodFoodAmount
  // ---------------------------------

  foodAmtMacroAmt(foodAmount: ComboFoodFoodAmount, macro: MacroNutrientType): number {
    console.log('foodAmount.scalar:', foodAmount.scalar);
    console.log('foodAmount.unit:', foodAmount.unit);

    // amount in 1 nutrient ref portion of food
    const nutrientRefAmt = this.nutrientAmtInFood(foodAmount.food, macro);
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
    return this.foodAmtMacroAmt(foodAmount, macro) * CalsPerMacro.get(macro);
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
      return convert(foodAmount.scalar).from(foodAmount.unit).to(intermediatePortion.metricUnit) / intermediatePortion.metricScalar;
    }
    else { // measure type is 'household'
      if (!isCustomUnitType) {
        return convert(foodAmount.scalar).from(foodAmount.unit).to(intermediatePortion.householdUnit) / intermediatePortion.householdScalar;
      } else {
        return foodAmount.scalar / intermediatePortion.householdScalar;
      }
    }
  }

  private convertConcreteAmountOfIntermediatePortionsToConcreteAmountOfNutrientRefPortions(
    intermediatePortion: Portion, intermediatePortions: number, nutrientRefPortion: Portion
  ): number {
    return convert(intermediatePortion.metricScalar).from(intermediatePortion.metricUnit).to(nutrientRefPortion.metricUnit)
      * intermediatePortions / nutrientRefPortion.metricScalar;
  }
}
