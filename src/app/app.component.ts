import { Component } from '@angular/core';
import { Food } from './models/food.model';
import { FdcApiService } from './services/api/fdc-api.service';
import { FoodApiService } from './services/api/food-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private foodApiService: FoodApiService, private fdcApiService: FdcApiService) { }
  private result: Food;

  doTheThing(): void {
    // this.foodApiService.getFood().subscribe(food => {
    //   console.log(food);
    //   this.result = food;
    // });

    this.fdcApiService.search('apple').subscribe(food => {
      console.log(food);
      this.result = food;
    });
  }

  doAnotherThing(): void {

  }
}
