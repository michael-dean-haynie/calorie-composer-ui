export interface PortionDTO {
    id?: string;
    baseUnitName: string;
    baseUnitAmount: number;
    isNutrientRefPortion: boolean;
    isServingSizePortion: boolean;
    description?: string;
    displayUnitName?: string;
    displayUnitAmount?: number;

}