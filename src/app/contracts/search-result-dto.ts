import { FoodDTO } from './food-dto';

export interface SearchResultDTO {
    totalHits: number;
    totalPages: number;
    currentPage: number;
    foods: FoodDTO[];
}