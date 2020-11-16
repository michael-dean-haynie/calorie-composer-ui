
export interface UnitDTO {
    id?: string;
    isDraft?: boolean;
    singular?: string;
    plural?: string;
    abbreviation?: string;
    draft: UnitDTO;
}