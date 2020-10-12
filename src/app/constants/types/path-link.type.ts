export class PathLink {
    source: string;
    sourceAmount: number;
    target: string;
    targetAmount: number;
    ratio: number; // targetAmount/sourceAmount so we can say 1 source = x target

    constructor(source: string, sourceAmount: number, target: string, targetAmount: number) {
        this.source = source;
        this.sourceAmount = sourceAmount;
        this.target = target;
        this.targetAmount = targetAmount;
        this.ratio = targetAmount / sourceAmount;
    }
}