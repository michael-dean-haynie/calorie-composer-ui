import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';

// Indicates whether component treats ctrl value as a selected value or a query for a value;
type FoodNameCtrlMode = 'selection' | 'query';

@Component({
  selector: 'app-combo-food-form-food-amount',
  templateUrl: './combo-food-form-food-amount.component.html',
  styleUrls: ['./combo-food-form-food-amount.component.scss']
})
export class ComboFoodFormFoodAmountComponent implements OnInit {

  @Input() foodAmountCtrl: FormGroup;

  foodNameCtrlMode: FoodNameCtrlMode = 'query';

  foodACOptions = new BehaviorSubject<Food[]>([]);

  food: Food;

  constructor(
    private foodApiService: FoodApiService
  ) { }

  ngOnInit(): void {
    this.foodAmountCtrl.get('foodName').valueChanges.pipe(
      tap(value => {
        // switch to query mode if change did not come from auto-complete selection
        if (!this.foodNameChangeIsFromACSelection(value)) {
          this.foodNameCtrlMode = 'query';
          this.food = null;
        }
      }),
      debounceTime(200)
    ).subscribe(value => {
      if (this.foodNameCtrlMode === 'query') {
        // query for auto complete options
        this.foodApiService.search(value).subscribe(results => {
          this.foodACOptions.next(results);
        });
      }
    });
  }

  updateSelectedFood(food: Food, event: MatOptionSelectionChange): void {
    if (event.source.selected) {
      this.foodNameCtrlMode = 'selection';
      this.food = food;
    }
  }

  foodNameChangeIsFromACSelection(value: string): boolean {
    // selection flag is set upon selection and before event makes it to the foonName ctrl
    // food value is also assigned upon selection.
    return this.foodNameCtrlMode === 'selection' && this.food.description === value;
  }

}
