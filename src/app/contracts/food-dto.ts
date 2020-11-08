import { ConversionRatioDTO } from './conversion-ratio-dto';
import { NutrientDTO } from './nutrient-dto';
import { UnitDTO } from './unit-dto';

export interface FoodDTO {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    ssrDisplayUnit: UnitDTO;
    csrDisplayUnit: UnitDTO;
    nutrients: NutrientDTO[];
    conversionRatios: ConversionRatioDTO[];
}