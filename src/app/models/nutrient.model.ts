import { NutrientType } from '../constants/types/nutrient.type';

export class Nutrient {
    id?: string;
    name: NutrientType;
    unitName: string;
    amount: number;
}