import { Unit } from 'src/app/models/unit.model';

export class PathLink {
    source: Unit;
    sourceAmount: number;
    target: Unit;
    targetAmount: number;
    ratio: number; // targetAmount/sourceAmount so we can say 1 source = x target

    constructor(source: Unit, sourceAmount: number, target: Unit, targetAmount: number) {
        this.source = source;
        this.sourceAmount = sourceAmount;
        this.target = target;
        this.targetAmount = targetAmount;
        this.ratio = targetAmount / sourceAmount;
    }
}