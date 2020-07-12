export interface ComboFoodPortionDTO {
    id?: string;
    isFoodAmountRefPortion: boolean;
    isServingSizePortion: boolean;
    metricUnit?: string;
    metricScalar?: number;
    householdUnit?: string;
    householdScalar?: number;
}