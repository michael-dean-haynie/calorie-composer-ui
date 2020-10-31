import { ConversionRatio } from './conversion-ratio.model';
import { Nutrient } from './nutrient.model';

export class Food {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    ssrDisplayUnit: string;
    csrDisplayUnit: string;
    nutrients: Nutrient[] = [];
    conversionRatios: ConversionRatio[] = [];
}