import { NutrientType } from '../constants/types/nutrient.type';
import { Unit } from './unit.model';

export class Nutrient {
    id?: string;
    name: NutrientType;
    unit: Unit;
    amount: number;
}