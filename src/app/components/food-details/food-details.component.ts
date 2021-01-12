import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Path } from 'src/app/constants/types/path.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Opt } from 'src/app/constants/types/select-options';
import { Food } from 'src/app/models/food.model';
import { Nutrient } from 'src/app/models/nutrient.model';
import { Unit } from 'src/app/models/unit.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { NewConversionRatioService } from 'src/app/services/new-conversion-ratio.service';

export interface FoodDetailsNutrientTableRow {
  name: string;
  amount: string;
}

@Component({
  selector: 'app-food-details',
  templateUrl: './food-details.component.html',
  styleUrls: ['./food-details.component.scss']
})
export class FoodDetailsComponent implements OnInit, OnDestroy {

  loading = true;
  foodId: string;
  food: Food;

  ssrDisplayValue: string;
  csrDisplayValue: string;
  displayUnitOpts: Opt[];
  selectedDisplayUnit = RefUnit.SERVING;
  macroTablePerUnit: Unit = this.servingUnit();

  nutrientsTableDisplayedColumns: string[] = ['name', 'amount'];
  nutrientsTableDataSource: MatTableDataSource<FoodDetailsNutrientTableRow> = new MatTableDataSource([]);

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private foodApiService: FoodApiService,
    private newConversionRatioService: NewConversionRatioService,
    private unitPipe: UnitPipe,
    private decimalPipe: DecimalPipe
  ) { }



  ngOnInit(): void {
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.foodId = params['id'];
        this.loadFood(this.foodId);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get nutrientsPerLabel() {
    if (this.selectedDisplayUnit === RefUnit.SERVING) {
      return `per ${this.ssrDisplayValue} portion`;
    } else if (this.selectedDisplayUnit === RefUnit.CONSTITUENTS) {
      return `per ${this.csrDisplayValue} portion`;
    }
  }

  onDisplayUnitChange(event: MatSelectChange) {
    this.selectedDisplayUnit = event.value;
    const unit = new Unit();
    unit.abbreviation = event.value;
    this.macroTablePerUnit = unit;

    // update nutrients table amoutns
    this.nutrientsTableDataSource.data = this.nutrientsAsRowModels(this.food.nutrients);
  }

  servingUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.SERVING;
    return unit;
  }

  constituentsUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.CONSTITUENTS;
    return unit;
  }

  applyNutrientFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.nutrientsTableDataSource.filter = filterValue.trim().toLowerCase();
  }



  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */
  private loadFood(foodId: string): void {
    this.loading = true;
    this.subscriptions.push(
      this.foodApiService.get(foodId).subscribe(food => {
        this.food = food;
        console.log(food);
        this.prepareDataForDisplayUnits(food);
        this.nutrientsTableDataSource.data = this.nutrientsAsRowModels(food.nutrients);
        this.loading = false;
      })
    );
  }

  private prepareDataForDisplayUnits(food: Food): void {
    this.ssrDisplayValue = this.resolveReferenceUnitDisplayValue(food, RefUnit.SERVING);
    this.csrDisplayValue = this.resolveReferenceUnitDisplayValue(food, RefUnit.CONSTITUENTS);
    this.displayUnitOpts = [
      {
        label: `${this.unitPipe.transform(RefUnit.SERVING, 'nutrient')} (${this.ssrDisplayValue})`,
        value: RefUnit.SERVING
      },
      {
        label: `${this.unitPipe.transform(RefUnit.CONSTITUENTS, 'nutrient')} (${this.csrDisplayValue})`,
        value: RefUnit.CONSTITUENTS
      }
    ];
  }

  private resolveReferenceUnitDisplayValue(food: Food, refUnit: string): string {
    let path: Path;
    const referenceUnit: Unit = new Unit();
    referenceUnit.abbreviation = refUnit;

    // check for explicitly set reference unit display unit
    const explicitlySetDisplayUnit =
      refUnit === RefUnit.SERVING
        ? food.ssrDisplayUnit
        : refUnit === RefUnit.CONSTITUENTS
          ? food.csrDisplayUnit
          : undefined;

    if (explicitlySetDisplayUnit) {
      path = this.newConversionRatioService.getPathForSourceAndTarget(food.conversionRatios, referenceUnit, explicitlySetDisplayUnit);

      if (!path) {
        console.error(`Expected path to exist for source: '${refUnit}' and target: '${explicitlySetDisplayUnit.abbreviation}'`);
      }
    }

    // else try to just pick a random unit that works
    if (!path) {
      const possiblePaths = this.newConversionRatioService.getPathsForUnit(food.conversionRatios, referenceUnit);
      if (!possiblePaths.length) {
        console.error(`Expected there to exist paths for source: '${refUnit}'`);
      } else {
        path = possiblePaths[0];
      }
    }

    if (path) {
      const amount = this.decimalPipe.transform(this.newConversionRatioService.getPathProduct(path), '1.0-2');
      const unit = this.unitPipe.transform(this.newConversionRatioService.getPathTarget(path).abbreviation, 'nutrient');
      return `${amount} ${unit}`;
    } else {
      return;
    }

  }

  // take nutrients, and map to row model after converting amount based on selected ref unit (if needed)
  private nutrientsAsRowModels(nutrients: Nutrient[]): FoodDetailsNutrientTableRow[] {
    return nutrients.map(nutrient => {
      let convFact = 1;

      // multiply values by conversion factor to provided amount and unit
      if (this.selectedDisplayUnit !== RefUnit.CONSTITUENTS) {
        const perUnit = new Unit();
        perUnit.abbreviation = this.selectedDisplayUnit;

        convFact = this.newConversionRatioService.convertUnitAmount(this.food.conversionRatios, 1, this.constituentsUnit(), perUnit);
      }

      return {
        name: nutrient.name,
        amount: `${this.decimalPipe.transform(nutrient.amount / convFact, '1.0-2')} ${nutrient.unit.abbreviation}`
      };
    });
  }

}
