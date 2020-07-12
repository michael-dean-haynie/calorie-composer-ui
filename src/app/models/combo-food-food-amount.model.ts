import { FoodAmount } from './food-amount';
import { Food } from './food.model';

export class ComboFoodFoodAmount implements FoodAmount {
    id?: string;
    food?: Food;
    unit?: string;
    scalar?: number;
}
