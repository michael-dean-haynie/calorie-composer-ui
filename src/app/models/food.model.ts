
import { Nutrient } from './nutrient.model';

export class Food {
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    servingSize: number;
    servingSizeUnit: string;
    nutrients: Nutrient[];

}