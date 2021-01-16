import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FoodDTO } from '../contracts/food-dto';
import { PageDTO } from '../contracts/page-dto';
import { FdcApiService } from './api/fdc-api.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  results = new BehaviorSubject<PageDTO<FoodDTO>>(null);
  selectedFoodFdcId = new BehaviorSubject<string>(null);
  latestQuery = new BehaviorSubject<string>(null);

  constructor(private fdcApiService: FdcApiService) { }

  search(query: string): void {
    this.fdcApiService.search(query).subscribe(searchResult => {
      this.results.next(searchResult);
    });
  }
}
