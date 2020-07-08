import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { AutoCompleteOptGroup } from 'src/app/constants/types/auto-complete-options.type';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';
import { FilteredAutocompleteComponent } from '../filtered-autocomplete/filtered-autocomplete.component';

// Indicates whether component treats ctrl value as a selected value or a query for a value;
type FoodNameCtrlMode = 'selection' | 'query';

@Component({
  selector: 'app-combo-food-form-food-amount',
  templateUrl: './combo-food-form-food-amount.component.html',
  styleUrls: ['./combo-food-form-food-amount.component.scss']
})
export class ComboFoodFormFoodAmountComponent implements OnInit {

  @Input() foodAmountCtrl: FormGroup;

  @ViewChild(FilteredAutocompleteComponent) filteredAutocompleteComponent: FilteredAutocompleteComponent;

  // TODO: make sure this works in the case of loading a draft or editing
  foodNameCtrlMode: FoodNameCtrlMode = 'query';

  foodACOptions = new BehaviorSubject<Food[]>([]);
  unitACOptions: AutoCompleteOptGroup[] = [];

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
      debounceTime(200)
    ).subscribe(value => {
      if (this.foodNameCtrlMode === 'query') {
        // query for auto complete options
        this.foodApiService.search(value).subscribe(results => {
          this.foodACOptions.next(results);
        });
      }
    });

    this.foodCtrl.valueChanges.subscribe((food: Food) => {
      if (food) {
        this.unitACOptions = this.mapUnitsToACOptions(this.unitService.getUnitsForFood(food));
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

  private mapUnitsToACOptions(units: UnitDescription[]): AutoCompleteOptGroup[] {
    return [
      {
        groupLabel: 'Mass',
        groupOptions: units
          .filter(unit => unit.measure === 'mass')
          .map(unit => this.mapUnitToACOption(unit))
      },
      {
        groupLabel: 'Volume',
        groupOptions: units
          .filter(unit => unit.measure === 'volume')
          .map(unit => this.mapUnitToACOption(unit))
      },
      {
        groupLabel: 'Other',
        groupOptions: units
          .filter(unit => !['volume', 'mass'].includes(unit.measure))
          .map(unit => this.mapUnitToACOption(unit))
      }
    ];
  }

  private mapUnitToACOption(unit: UnitDescription): any {
    return unit.abbr
      ? {
        label: `${unit.plural} (${unit.abbr})`,
        value: unit.abbr
      }
      : {
        label: unit.plural,
        value: unit.plural
      };
  }

}
