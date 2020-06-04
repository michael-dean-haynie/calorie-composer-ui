import { Component } from '@angular/core';
import { FoodApiService } from './services/api/food-api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private foodApiService: FoodApiService) { }

  doTheThing(): void {
    this.foodApiService.getFood().subscribe(food => console.log(food));
  }
}
