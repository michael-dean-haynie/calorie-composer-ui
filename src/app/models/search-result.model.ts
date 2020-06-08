import { Food } from './food.model';

export class SearchResult {
    totalHits: number;
    totalPages: number;
    currentPage: number;
    foods: Food[];
}