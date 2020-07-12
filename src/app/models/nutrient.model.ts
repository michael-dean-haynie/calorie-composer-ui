import { NutrientType } from '../constants/types/nutrient.type';

export class Nutrient {
    id?: string;
    name: NutrientType;
    unit: string;
    scalar: number;
}