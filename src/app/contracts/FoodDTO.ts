import { NutrientDTO } from './NutrientDTO';

export interface FoodDTO {
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: NutrientDTO[];
}