import { NutrientDTO } from './nutrient-dto';
import { PortionDTO } from './portion-dto';

export interface FoodDTO {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    nutrients: NutrientDTO[];
    portions: PortionDTO[];
}