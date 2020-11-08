import { Unit } from './unit.model';

export class ConversionRatio {
    id?: string;
    amountA: number;
    unitA: Unit;
    freeFormValueA: string;
    amountB: number;
    unitB: Unit;
    freeFormValueB: string;
}