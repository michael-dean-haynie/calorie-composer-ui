import { Nutrient } from './nutrient.model';
import { Portion } from './portion.model';

export class Food {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    nutrients: Nutrient[];
    portions: Portion[];
}