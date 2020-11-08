import { ConversionRatio } from './conversion-ratio.model';
import { Nutrient } from './nutrient.model';
import { Unit } from './unit.model';

export class Food {
    id?: string;
    fdcId: string;
    description: string;
    brandOwner: string;
    ingredients: string;
    ssrDisplayUnit: Unit;
    csrDisplayUnit: Unit;
    nutrients: Nutrient[] = [];
    conversionRatios: ConversionRatio[] = [];
}