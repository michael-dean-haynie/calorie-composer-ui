import { UnitDTO } from './unit-dto';

export interface ConversionRatioDTO {
    id?: string;
    amountA: number;
    unitA: UnitDTO;
    freeFormValueA: string;
    amountB: number;
    unitB: UnitDTO;
    freeFormValueB: string;
}