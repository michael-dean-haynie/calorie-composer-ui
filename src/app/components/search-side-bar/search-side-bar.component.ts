import { Component, OnInit } from '@angular/core';
import { Food } from 'src/app/models/food.model';
import { SearchResult } from 'src/app/models/search-result.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-side-bar',
  templateUrl: './search-side-bar.component.html',
  styleUrls: ['./search-side-bar.component.scss']
})
export class SearchSideBarComponent implements OnInit {

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

}
