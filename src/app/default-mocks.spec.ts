import { CommonPortion } from './constants/types/common-portion.type';
import { UnitScalar } from './constants/types/unit-scalar.type';

export class DefaultMocks {
    static CommonPortion(): CommonPortion {
        return {
            id: '1',
            isServingSizePortion: false,
            metricUnit: 'g',
            metricScalar: 1.23,
            householdUnit: 'cups',
            householdScalar: 4.56,
            householdMeasure: undefined
        };
    }

    static UnitScalar(): UnitScalar {
        return {
            unit: 'g',
            scalar: 1.23
        };
    }
}