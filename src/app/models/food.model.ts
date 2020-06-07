
import { MacroNutrientEnum } from '../constants/enums/macro-nutrient.enum';
import { Nutrient } from './nutrient.model';

export class Food {
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

    macroAmt(macro: MacroNutrientEnum): number {
        // return this.nutrients.find(nutrient => nutrient.name === macro.toString()).amount;
        return 0;
    }

    macroCals(macro: MacroNutrientEnum): number {
        // return this.macroAmt(macro) * MacroCals.get(macro);
        return 0;
    }

    macroPctg(macro: MacroNutrientEnum): number {
        const sumReducer = (accumulator, currentValue) => accumulator + currentValue;

        const totalCalsFromMacros = [MacroNutrientEnum.Fat, MacroNutrientEnum.Carbohydrate, MacroNutrientEnum.Protein]
            .map(macroNutrient => this.macroCals(macroNutrient))
            .reduce(sumReducer);

        return (this.macroCals(macro) / totalCalsFromMacros) * 100;
    }
}