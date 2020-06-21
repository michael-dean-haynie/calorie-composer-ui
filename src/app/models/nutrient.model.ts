import { NutrientType } from '../constants/types/nutrient.type';

export class Nutrient {
    id?: string;
    nutrient: NutrientType;
    unitName: string;
    amount: number;
}