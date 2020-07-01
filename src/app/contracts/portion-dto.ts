export interface PortionDTO {
    id?: string;
    isNutrientRefPortion: boolean;
    isServingSizePortion: boolean;
    metricUnit: string;
    metricAmount: number;
    householdMeasure?: string;
    householdUnit?: string;
    householdAmount?: number;

}