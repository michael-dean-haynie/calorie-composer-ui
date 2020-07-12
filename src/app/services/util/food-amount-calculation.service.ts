import { Injectable } from '@angular/core';
import convert from 'convert-units';
import { CalsPerMacro } from 'src/app/constants/cals-per-macro';
import { SumReducer } from 'src/app/constants/functions';
import { MacroNutrientType, MacroNutrientTypes } from 'src/app/constants/types/macro-nutrient.type';
import { NutrientType } from 'src/app/constants/types/nutrient.type';
import { PortionMeasureType } from 'src/app/constants/types/portion-measure-type.type';
import { FoodAmount } from 'src/app/models/food-amount';
import { Portion } from 'src/app/models/portion.model';
import { NutrientCalculationService } from './nutrient-calculation.service';
import { UnitService } from './unit.service';

@Injectable({
  providedIn: 'root'
})
export class FoodAmountCalculationService {

  constructor(
    private nutrientCalc: NutrientCalculationService,
    private unitService: UnitService
  ) { }

  // TODO: Maybe this check should not live here and this operation should be prevented by componenet by validating formgroup
  /**
   * Determines if a FoodAmount has all the fields needed for calculations to be performed.
   * @param foodAmount the food amount
   */
  foodAmountIsCalculable(foodAmount: FoodAmount): boolean {
    const foodIsSet = !!foodAmount.food;
    const scalarIsSet = foodAmount.scalar !== undefined && foodAmount.scalar !== null;
    // add check for unit being valid unit
    const unitIsSet = !!foodAmount.unit;

    return foodIsSet && scalarIsSet && unitIsSet;
  }

  /**
   * Calculates the concrete amount of a NutrientType in a FoodAmount
   * Only returns the scalar (no unit). The implied unit is what's defined on the Nutrient in the Food.
   *
   * @param foodAmount the food amount
   * @param nutrientType the nutrient to calculate the amount of
   * @returns scalar amount of the nutrient in the food amount.
   *  Returns 0 if the food does not specify a value for the nutrient.
   */
  nutrientAmtInFoodAmount(foodAmount: FoodAmount, nutrientType: NutrientType): number {
    // amount in 1 nutrient ref portion of food
    const nutrientRefAmt = this.nutrientCalc.nutrientAmtInFood(foodAmount.food, nutrientType);

    // determine unit type of foodAmount unit
    const foodAmountUnitType = this.unitService.getUnitType(foodAmount.unit);

    // Step 1: select intermediate portion: a portion that has the same unit type as food amount unit
    let intermediatePortion: Portion = null;
    let intermediatePortionMeasureType: PortionMeasureType = 'metric';
    let householdUnitTypeIsRecognized = true;

    // first try the metric unit of each portion
    intermediatePortion = foodAmount.food.portions
      .find(portion => this.unitService.getUnitType(portion.metricUnit) === foodAmountUnitType);

    // next try the household unit of each portion (where the unit type is recognized)
    if (!intermediatePortion) {
      intermediatePortionMeasureType = 'household';
      intermediatePortion = foodAmount.food.portions
        // TODO: filter out portions that don't have valid unit-scalar amount
        .filter(portion => portion.householdUnit) // remove portions with falsey values for household unit
        .filter(portion => this.unitService.getUnitType(portion.householdUnit)) // only recognized unit types
        .find(portion => this.unitService.getUnitType(portion.householdUnit) === foodAmountUnitType);
    }

    // next try the household unit of each portion (whether or not unit type is recognized, but must be exact match)
    if (!intermediatePortion) {
      householdUnitTypeIsRecognized = false;
      intermediatePortion = foodAmount.food.portions
        // TODO: filter out portions that don't have valid unit-scalar amount
        .filter(portion => portion.householdUnit) // remove portions with falsey values for household unit
        .find(portion => portion.householdUnit === foodAmount.unit);
    }

    if (!intermediatePortion) {
      console.error('food portions:', foodAmount.food.portions);
      console.error(`Could not find suitable portion for nutrient calculation of FoodAmount. foodAmmount unit: ${foodAmount.unit}, foodAmountUnitType: ${foodAmountUnitType}`);
      return;
    }

    // Step 2: select a nutrient reference portion that can map the intermediate portion to nutrient values
    const nutrientRefPortion = foodAmount.food.portions
      .filter(portion => portion.isNutrientRefPortion)
      .find(portion => this.unitService.getUnitType(portion.metricUnit) === this.unitService.getUnitType(intermediatePortion.metricUnit));

    if (!nutrientRefPortion) {
      console.error('food portions:', foodAmount.food.portions);
      console.error(`Could not find suitable nutrient ref portion for nutrient calculation of FoodAmount. foodAmmount unit: ${foodAmount.unit}, foodAmountUnitType: ${foodAmountUnitType}`);
      return;
    }


    // Step 3: Calculate the nutrient amount.
    // Start with the foodAmount, convert that to an amount of intermediate portions, convert that
    // to an amount of nutrient reference portions, multiply that by the nutrient ref amount
    const intermediatePortions = this.convertFoodAmountIntoAmountOfIntermediatePortions(
      foodAmount, intermediatePortion, intermediatePortionMeasureType, householdUnitTypeIsRecognized
    );

    const refPortions = this.convertAmountOfIntermediatePortionsIntoAmountOfNutrientRefPortions(
      intermediatePortion, intermediatePortions, nutrientRefPortion
    );

    // in units defined in nutrient model
    const nutrientAmt = refPortions * nutrientRefAmt;
    return nutrientAmt;
  }

  /**
   * Calculates the concrete amount of kcals in a FoodAmount for a MacroNutrientType
   *
   * @param foodAmount the food amount
   * @param macro the macronutrient to calculate the kcals for
   * @returns the kcals in the food amount for this particular macronutrient
   */
  calsInFoodAmountForMacro(foodAmount: FoodAmount, macro: MacroNutrientType): number {
    return this.nutrientAmtInFoodAmount(foodAmount, macro) * CalsPerMacro.get(macro);
  }

  /**
   * Calculates the total kcals in a FoodAmount
   * Derrived as sum of marcronutrient kcals
   *
   * @param foodAmount the food amount
   * @returns the total amount of kcals in a FoodAmount
   */
  calsInFoodAmount(foodAmount: FoodAmount): number {
    return MacroNutrientTypes
      .map(macro => this.calsInFoodAmountForMacro(foodAmount, macro))
      .reduce(SumReducer);
  }



  /**
   * Takes food amount (with unit and scalar) and converts that into a scalar of the intermediate portion as
   * a unit itself.
   *
   * Ex: Food amount is 50 grams. Intermediate portion is 20 grams.
   * This would return 2.5 because 50 grams = 2.5 intermediate portions (20 grams each).
   * 
   * @param foodAmount the food amount
   * @param intermediatePortion the intermediate portion
   * @param measureType the measure type that the intermediate portion was selected for
   * @param householdUnitTypeIsRecognized whether the household unit has a recognized unit type
   */
  private convertFoodAmountIntoAmountOfIntermediatePortions(
    foodAmount: FoodAmount, intermediatePortion: Portion, measureType: PortionMeasureType, householdUnitTypeIsRecognized: boolean
  ): number {
    // If the intermediate portion was selected for its metric measure, use those fields
    if (measureType === 'metric') {
      return convert(foodAmount.scalar).from(foodAmount.unit).to(intermediatePortion.metricUnit) / intermediatePortion.metricScalar;
    }
    else { // Otherwise use the intermediate portion's household measure
      if (householdUnitTypeIsRecognized) {
        return convert(foodAmount.scalar).from(foodAmount.unit).to(intermediatePortion.householdUnit) / intermediatePortion.householdScalar;
      } else {
        // If the unit type is not recognized by unit conversion library (e.g. 'scoops' or 'handfull'), this intermediate portion must
        // have been selected by exact match of household unit, so no need for unit conversion.
        return foodAmount.scalar / intermediatePortion.householdScalar;
      }
    }
  }

  /**
   * Takes an amount of intermediate portions and converts that into an amount of nutrient reference portions.
   *
   * Ex: Intermediate portion is 50 grams. Nutrient reference portion is 100 grams.
   * This would return 0.5 because 50 grams = 0.5 nutrient ref portions (100 grams each).
   *
   * @param intermediatePortion the intermediate portion
   * @param intermediatePortions the (scalar) amount of intermediate portions to convert
   * @param nutrientRefPortion the nutrient reference portion to convert to
   */
  private convertAmountOfIntermediatePortionsIntoAmountOfNutrientRefPortions(
    intermediatePortion: Portion, intermediatePortions: number, nutrientRefPortion: Portion
  ): number {
    // Every portion is guarenteed to have a metric unit so unit conversion library is always fine.
    // Nutrient ref portion was selected to match intermediate portion unit type (mass/volume) so compatiblity is guarenteed.
    return convert(intermediatePortion.metricScalar).from(intermediatePortion.metricUnit).to(nutrientRefPortion.metricUnit)
      * intermediatePortions / nutrientRefPortion.metricScalar;
  }
}
