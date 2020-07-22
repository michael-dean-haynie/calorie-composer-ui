// Could be a Portion or a ComboFoodPortion
export interface CommonPortion {
    id?: string;
    isServingSizePortion: boolean;
    metricUnit?: string;
    metricScalar?: number;
    householdMeasure?: string;
    householdUnit?: string;
    householdScalar?: number;
}
