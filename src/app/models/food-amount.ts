import { Food } from './food.model';

export interface FoodAmount {
    food?: Food;
    unit?: string;
    scalar?: number;
}
