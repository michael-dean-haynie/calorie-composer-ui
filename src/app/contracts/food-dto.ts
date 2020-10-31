import { ConversionRatioDTO } from './conversion-ratio-dto';
import { NutrientDTO } from './nutrient-dto';

export interface FoodDTO {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    ssrDisplayUnit: string;
    csrDisplayUnit: string;
    nutrients: NutrientDTO[];
    conversionRatios: ConversionRatioDTO[];
}