import { ComboFoodFoodAmount } from './combo-food-food-amount.model';
import { ComboFoodPortion } from './combo-food-portion.model';

export class ComboFood {
    id?: string;
    isDraft: boolean;
    description?: string;
    foodAmounts: ComboFoodFoodAmount[] = [];
    portions: ComboFoodPortion[] = [];
}