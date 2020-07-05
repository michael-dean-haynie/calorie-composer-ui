import { FoodDTO } from './food-dto';

export interface ComboFoodFoodAmountDTO {
    id?: string;
    food?: FoodDTO;
    unit?: string;
    amount?: number;
}