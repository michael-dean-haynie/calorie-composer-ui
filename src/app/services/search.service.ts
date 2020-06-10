import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Food } from '../models/food.model';
import { SearchResult } from '../models/search-result.model';
import { FdcApiService } from './api/fdc-api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  results = new BehaviorSubject<SearchResult>(null);
  selectedFood = new BehaviorSubject<Food>(null);
  latestQuery = new BehaviorSubject<string>('');

  constructor(private fdcApiService: FdcApiService) { }

  search(query: string) {
    this.fdcApiService.search(query).subscribe(searchResult => {
      this.results.next(searchResult);
    });
  }
}
