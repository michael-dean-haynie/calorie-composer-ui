import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Path } from 'src/app/constants/types/path.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Opt } from 'src/app/constants/types/select-options';
import { Food } from 'src/app/models/food.model';
import { Unit } from 'src/app/models/unit.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { NewConversionRatioService } from 'src/app/services/new-conversion-ratio.service';

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
  macroTablePerUnit: Unit = this.constituentsUnit();
  macroTablePerAmt = 1;


  RefUnit = RefUnit;


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

  onDisplayUnitChange(event: MatSelectChange) {
    const unit = new Unit();
    unit.abbreviation = event.value;
    this.macroTablePerUnit = unit;
    this.macroTablePerAmt = 1;
  }

  constituentsUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.CONSTITUENTS;
    return unit;
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
        this.prepareDataForDisplayUnits(food);
        this.loading = false;
      })
    );
  }

  private prepareDataForDisplayUnits(food: Food): void {
    this.ssrDisplayValue = this.resolveReferenceUnitDisplayValue(food, RefUnit.SERVING);
    this.csrDisplayValue = this.resolveReferenceUnitDisplayValue(food, RefUnit.CONSTITUENTS);
    this.displayUnitOpts = [
      {
        label: `${this.unitPipe.transform(RefUnit.CONSTITUENTS, 'nutrient')} (${this.csrDisplayValue})`,
        value: RefUnit.CONSTITUENTS
      },
      {
        label: `${this.unitPipe.transform(RefUnit.SERVING, 'nutrient')} (${this.ssrDisplayValue})`,
        value: RefUnit.SERVING
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

}
