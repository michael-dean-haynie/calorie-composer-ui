import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { ACGroup } from 'src/app/constants/types/auto-complete-options.type';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { UnitService } from 'src/app/services/util/unit.service';

// Indicates whether component treats ctrl value as a selected value or a query for a value;
type FoodNameCtrlMode = 'selection' | 'query';

@Component({
  selector: 'app-combo-food-form-food-amount',
  templateUrl: './combo-food-form-food-amount.component.html',
  styleUrls: ['./combo-food-form-food-amount.component.scss']
})
export class ComboFoodFormFoodAmountComponent implements OnInit {

  @Input() foodAmountCtrl: FormGroup;

  // TODO: make sure this works in the case of loading a draft or editing
  foodNameCtrlMode: FoodNameCtrlMode = 'query';

  foodACOptions = new BehaviorSubject<Food[]>([]);

  unitACOptions: ACGroup[] = [];

  constructor(
    private foodApiService: FoodApiService,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    this.foodAmountCtrl.get('foodName').valueChanges.pipe(
      tap(value => {
        // switch to query mode if change did not come from auto-complete selection
        if (!this.foodNameChangeIsFromACSelection(value)) {
          this.foodNameCtrlMode = 'query';
          this.foodCtrl.setValue(null);
        }
      }),
      // TODO: remove
      tap(() => console.log(this.foodCtrl.value ? this.unitService.getUnitsForFood(this.foodCtrl.value) : 'null right now')),
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

  get foodCtrl(): FormControl {
    return this.foodAmountCtrl.get('food') as FormControl;
  }

  updateSelectedFood(food: Food, event: MatOptionSelectionChange): void {
    if (event.source.selected) {
      this.foodNameCtrlMode = 'selection';
      this.foodCtrl.setValue(food);
    }
  }

  foodNameChangeIsFromACSelection(value: string): boolean {
    // selection flag is set upon selection and before event makes it to the foonName ctrl
    // food value is also assigned upon selection.
    return this.foodNameCtrlMode === 'selection' && this.foodCtrl.value.description === value;
  }

}
