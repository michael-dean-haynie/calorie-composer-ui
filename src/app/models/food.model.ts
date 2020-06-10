
import { MacroNutrientType } from '../constants/types/macro-nutrient.type';
import { Nutrient } from './nutrient.model';

export class Food {
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: Nutrient[];

    // constructor(foodDTO: FoodDTO) {
    //     this.description = foodDTO.description;
    //     this.brandOwner = foodDTO.brandOwner;
    //     this.ingredients = foodDTO.ingredients;
    //     this.servingSize = foodDTO.servingSize;
    //     this.servingSizeUnit = foodDTO.servingSizeUnit;
    //     this.nutrients = foodDTO.nutrients.map(nutrientDTO => new Nutrient(nutrientDTO));
    // }

    macroAmt(macro: MacroNutrientType): number {
        // return this.nutrients.find(nutrient => nutrient.name === macro.toString()).amount;
        return 0;
    }

    macroCals(macro: MacroNutrientType): number {
        // return this.macroAmt(macro) * MacroCals.get(macro);
        return 0;
    }

    macroPctg(macro: MacroNutrientType): number {

        const macros: MacroNutrientType[] = ['Fat', 'Carbohydrate', 'Protein'];

        const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

        const totalCalsFromMacros = macros
            .map(macroNutrient => this.macroCals(macroNutrient))
            .reduce(sumReducer);

        return (this.macroCals(macro) / totalCalsFromMacros) * 100;
    }
}