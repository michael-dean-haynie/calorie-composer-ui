import { Component, Host, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { AutoCompleteOptGroup } from 'src/app/constants/types/auto-complete-options.type';
import { ComboFoodFoodAmount } from 'src/app/models/combo-food-food-amount.model';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { ComboFoodFoodAmountMapperService } from 'src/app/services/mappers/combo-food-food-amount-mapper.service';
import { ComboFoodMapperService } from 'src/app/services/mappers/combo-food-mapper.service';
import { NutrientCalculationService } from 'src/app/services/util/nutrient-calculation.service';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';
import { ComboFoodFormComponent } from '../combo-food-form/combo-food-form.component';
import { FilteredAutocompleteComponent } from '../filtered-autocomplete/filtered-autocomplete.component';

// Indicates whether component treats ctrl value as a selected value or a query for a value;
type FoodNameCtrlMode = 'selection' | 'query';

interface CaloricBreakdown {
  fat: number;
  carbs: number;
  protein: number;
}

// Caloric breakdown as constituent of whole
interface CstCaloricBreakdown {
  cal: { amount: number, pctg: number },
  fat: { amount: number, pctg: number };
  carbs: { amount: number, pctg: number };
  protein: { amount: number, pctg: number };
}

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

  caloricBreakdownDataSource = new BehaviorSubject<CaloricBreakdown[]>(null);
  caloricBreakdownDisplayedColumns = ['fat', 'carbs', 'protein'];

  cstCaloricBreakdownDataSource = new BehaviorSubject<CstCaloricBreakdown[]>(null);
  cstCaloricBreakdownDisplayedColumns = ['cal', 'fat', 'carbs', 'protein'];

  constructor(
    private foodApiService: FoodApiService,
    private unitService: UnitService,
    private nutrientCalculationService: NutrientCalculationService,
    private comboFoodFoodAmountMapperService: ComboFoodFoodAmountMapperService,
    private comboFoodMapperService: ComboFoodMapperService,
    @Host() private parent: ComboFoodFormComponent
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

    this.parent.comboFoodForm.valueChanges.subscribe(() => {
      if (this.foodAmountIsFullyDefined) {
        this.cstCaloricBreakdownDataSource.next([
          this.mapFoodAmountToCstCaloricBreakdown(
            this.comboFoodFoodAmountMapperService.formGroupToModel(this.foodAmountCtrl)
          )
        ]);
      } else {
        this.cstCaloricBreakdownDataSource.next([]);
      }
    });
  }

  get foodCtrl(): FormControl {
    return this.foodAmountCtrl.get('food') as FormControl;
  }

  get foodAmountIsFullyDefined(): boolean {
    const foodIsSet = this.foodAmountCtrl.get('food').value;
    const amountIsSet = !['', null, undefined].some(badVal => badVal === this.foodAmountCtrl.get('amount').value);
    // add check for unit being valid unit
    const unitIsSet = this.foodAmountCtrl.get('unit').value;

    return foodIsSet && amountIsSet && unitIsSet;
  }

  updateSelectedFood(food: Food, event: MatOptionSelectionChange): void {
    if (event.source.selected) {
      this.foodNameCtrlMode = 'selection';
      this.foodCtrl.setValue(food);
      this.caloricBreakdownDataSource.next([this.mapFoodToCaloricBreakdown(this.foodCtrl.value)]);
    }
  }

  foodNameChangeIsFromACSelection(value: string): boolean {
    // selection flag is set upon selection and before event makes it to the foonName ctrl
    // food value is also assigned upon selection.
    return this.foodNameCtrlMode === 'selection' && this.foodCtrl.value.description === value;
  }

  logit(): void {
    // TODO: remove
    const model = this.comboFoodFoodAmountMapperService.formGroupToModel(this.foodAmountCtrl);
    console.log(this.nutrientCalculationService.foodAmtMacroAmt(model, 'Fat'));
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

  private mapFoodToCaloricBreakdown(food: Food): CaloricBreakdown {
    return {
      fat: this.nutrientCalculationService.macroPctg(food, 'Fat'),
      carbs: this.nutrientCalculationService.macroPctg(food, 'Carbohydrate'),
      protein: this.nutrientCalculationService.macroPctg(food, 'Protein')
    };
  }

  private mapFoodAmountToCstCaloricBreakdown(foodAmount: ComboFoodFoodAmount): CstCaloricBreakdown {
    const comboFood = this.comboFoodMapperService.formGroupToModel(this.parent.comboFoodForm);

    return {
      cal: {
        amount: this.nutrientCalculationService.comboFoodCalAmt(comboFood),
        pctg: this.nutrientCalculationService.foodAmtCalPctg(foodAmount, comboFood)
      },
      fat: {
        amount: this.nutrientCalculationService.foodAmtMacroAmt(foodAmount, 'Fat'),
        pctg: this.nutrientCalculationService.foodAmtMacroPctg(
          foodAmount, comboFood, 'Fat'
        )
      },
      carbs: {
        amount: this.nutrientCalculationService.foodAmtMacroAmt(foodAmount, 'Carbohydrate'),
        pctg: this.nutrientCalculationService.foodAmtMacroPctg(
          foodAmount, comboFood, 'Carbohydrate'
        )
      },
      protein: {
        amount: this.nutrientCalculationService.foodAmtMacroAmt(foodAmount, 'Protein'),
        pctg: this.nutrientCalculationService.foodAmtMacroPctg(
          foodAmount, comboFood, 'Protein'
        )
      },
    };
  }

}
