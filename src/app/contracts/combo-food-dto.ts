import { ComboFoodFoodAmountDTO } from './combo-food-food-amount-dto';
import { ComboFoodPortionDTO } from './combo-food-portion-dto';

export interface ComboFoodDTO {
    id?: string;
    isDraft: boolean;
    description?: string;
    foodAmounts: ComboFoodFoodAmountDTO[];
    portions: ComboFoodPortionDTO[];
}