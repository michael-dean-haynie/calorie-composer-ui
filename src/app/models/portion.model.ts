
export class Portion {
    id?: string;
    isNutrientRefPortion: boolean;
    isServingSizePortion: boolean;
    metricUnit: string;
    metricScalar: number;
    householdMeasure?: string;
    householdUnit?: string;
    householdScalar?: number;
}