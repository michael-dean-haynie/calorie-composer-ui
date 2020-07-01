
export class Portion {
    id?: string;
    isNutrientRefPortion: boolean;
    isServingSizePortion: boolean;
    metricUnit: string;
    metricAmount: number;
    householdMeasure?: string;
    householdUnit?: string;
    householdAmount?: number;
}