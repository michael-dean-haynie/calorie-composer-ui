import { NutrientEnum } from '../constants/enums/nutrient.enum';

export class Nutrient {
    nutrient: NutrientEnum;
    unitName: string;
    amount: number;

    // constructor(nutrientDTO: NutrientDTO) {
    //     console.log('in the constructor');
    //     this.nutrient = NutrientEnum[nutrientDTO.name];
    //     this.unitName = nutrientDTO.unitName;
    //     this.amount = nutrientDTO.amount;

    //     if (this.nutrient === undefined) {
    //         console.warn(`Unable to map string "${nutrientDTO.name}" to NutrientEnum`);
    //     }
    // }
}