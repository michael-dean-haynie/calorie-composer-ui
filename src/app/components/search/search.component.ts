import { Component, OnInit } from '@angular/core';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { SearchService } from 'src/app/services/search.service';

// specific for this component
type LayoutMode = 'narrow' | 'wide';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  layoutMode: LayoutMode = 'narrow';
  selectedFood: Food = null;

  constructor(
    private responsiveService: ResponsiveService,
    private searchService: SearchService,
    private foodApiService: FoodApiService
  ) { }

  ngOnInit(): void {
    this.responsiveService.windowWidth.subscribe(windowWidth => {
      this.setLayoutMode(windowWidth);
    });

    this.searchService.selectedFood.subscribe(food => this.selectedFood = food);
  }

  import(): void {
    this.foodApiService.post(this.selectedFood).subscribe(food => console.log(food));
  }

  private setLayoutMode(windowWidth: number) {
    this.layoutMode = windowWidth < 800 ? 'narrow' : 'wide';
  }

}
