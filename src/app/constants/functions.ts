export const SumReducer = (accumulator, currentValue) => accumulator + currentValue;

export const ProductReducer = (accumulator, currentValue) => accumulator * currentValue;

export const IsMeaningfulValue = (value): boolean => {
    return value !== undefined && value !== null && ('' + value).trim() !== '';
}

/**
 * Checks if value is null or undefined
 */
export const isNOU = (value: any): boolean => {
    if (value === null || value === undefined) {
        return true;
    }
    return false;
}
