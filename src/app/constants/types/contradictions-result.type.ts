export class ContradictionsResult {
    contradictionsExist: boolean;
    conversionChains?: string[];

    constructor(contradictionsExist: boolean, conversionChains?: string[]) {
        this.contradictionsExist = contradictionsExist;
        this.conversionChains = conversionChains;
    }
}