import { Component, OnInit } from '@angular/core';
import { Food } from 'src/app/models/food.model';
import { SearchResult } from 'src/app/models/search-result.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-narrow-search-results',
  templateUrl: './narrow-search-results.component.html',
  styleUrls: ['./narrow-search-results.component.scss']
})
export class NarrowSearchResultsComponent implements OnInit {

  results: SearchResult;
  selectedFood: Food;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchService.results.subscribe(results => this.results = results);

    this.searchService.selectedFood.subscribe(food => this.selectedFood = food);
  }

  foodSelected(food: Food): void {
    this.searchService.selectedFood.next(food);
  }

  foodUnselected(): void {
    this.searchService.selectedFood.next(null);
  }
}
