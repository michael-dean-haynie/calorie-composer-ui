import { NutrientDTO } from './nutrient-dto';

export interface FoodDTO {
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: NutrientDTO[];
}