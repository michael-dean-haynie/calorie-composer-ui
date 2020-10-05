export const SumReducer = (accumulator, currentValue) => accumulator + currentValue;

export const IsMeaningfulValue = (value): boolean => {
    return value !== undefined && value !== null && ('' + value).trim() !== '';
}
