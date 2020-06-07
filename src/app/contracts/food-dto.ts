import { NutrientDTO } from './nutrient-dto';

export interface FoodDTO {
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: NutrientDTO[];
}