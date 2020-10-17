import { ContradictionsResult } from './contradictions-result.type';

export class ContradictionsError extends Error {
    readonly result: ContradictionsResult;

    constructor(result: ContradictionsResult) {
        super('Contradictions Exist!');
        this.result = result;

    }
}