import { Injectable } from '@angular/core';
import { SearchResultDTO } from 'src/app/contracts/search-result-dto';
import { SearchResult } from 'src/app/models/search-result.model';
import { FoodMapperService } from './food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class SearchResultMapperService {

  constructor(private foodMapperService: FoodMapperService) { }

  dtoToModel(searchResultDTO: SearchResultDTO): SearchResult {
    const searchResult = new SearchResult();
    searchResult.totalHits = searchResultDTO.totalHits;
    searchResult.totalPages = searchResultDTO.totalPages;
    searchResult.currentPage = searchResultDTO.currentPage;
    searchResult.foods = searchResultDTO.foods.map(foodDTO => this.foodMapperService.dtoToModel(foodDTO));

    return searchResult;
  }
}
