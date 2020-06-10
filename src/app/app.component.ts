import { Component } from '@angular/core';
import { Food } from './models/food.model';
import { FdcApiService } from './services/api/fdc-api.service';
import { FoodApiService } from './services/api/food-api.service';
import { ResponsiveService } from './services/responsive.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private foodApiService: FoodApiService,
    private fdcApiService: FdcApiService,
    responsiveService: ResponsiveService
  ) { }

  private result: Food;

  doTheThing(): void {
    this.fdcApiService.search('apple').subscribe(result => {
      console.log(result);
    });
  }

  doAnotherThing(): void {

  }
}
