import { NutrientDTO } from '../contracts/NutrientDTO';

export class Nutrient {
    name: string;
    unitName: string;
    amount: number;

    constructor(nutrientDTO: NutrientDTO) {
        this.name = nutrientDTO.name;
        this.unitName = nutrientDTO.unitName;
        this.amount = nutrientDTO.amount;
    }
}