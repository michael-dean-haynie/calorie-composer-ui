import { UnitDTO } from './unit-dto';

export interface NutrientDTO {
    id?: string;
    name: string;
    unit: UnitDTO;
    amount: number;
}