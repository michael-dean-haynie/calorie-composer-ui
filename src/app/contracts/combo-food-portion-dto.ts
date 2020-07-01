export interface ComboFoodPortionDTO {
    id?: string;
    isFoodAmountRefPortion: boolean;
    isServingSizePortion: boolean;
    metricUnit?: string;
    metricAmount?: number;
    householdMeasure?: string;
    householdUnit?: string;
    householdAmount?: number;
}