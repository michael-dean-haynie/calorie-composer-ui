import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SumReducer } from 'src/app/constants/functions';
import { MacroNutrientType } from 'src/app/constants/types/macro-nutrient.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Food } from 'src/app/models/food.model';
import { Unit } from 'src/app/models/unit.model';
import { NewConversionRatioService } from 'src/app/services/new-conversion-ratio.service';
import { NutrientCalculationService } from 'src/app/services/util/nutrient-calculation.service';

@Component({
  selector: 'app-macro-table',
  templateUrl: './macro-table.component.html',
  styleUrls: ['./macro-table.component.scss']
})
export class MacroTableComponent implements OnInit, OnChanges {

  @Input() food: Food;
  @Input() perUnit: Unit = this.constituentsUnit;
  @Input() perAmt: number = 1;

  loading = true;
  numFmt = '1.0-2';
  displayedColumns = ['macro', 'pctg', 'weight', 'kcal'];
  dataSource = [];

  constructor(
    private nutrientCalculationService: NutrientCalculationService,
    private newConversionRatioService: NewConversionRatioService
  ) { }

  ngOnInit(): void {
    this.dataSource = this.loadData(this.food, this.perAmt, this.perUnit);
    this.loading = false;
  }

  ngOnChanges(): void {
    this.loading = true;
    this.dataSource = this.loadData(this.food, this.perAmt, this.perUnit);
    this.loading = false;
  }

  get servingUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.SERVING;
    return unit;
  }

  get constituentsUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.CONSTITUENTS;
    return unit;
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private loadData(food: Food, perAmt: number, perUnit: Unit): any[] {
    const totalKcals = (['Fat', 'Carbohydrate', 'Protein'] as MacroNutrientType[])
      .map(nutrientType => this.nutrientCalculationService.calsInFoodForMacro(food, nutrientType))
      .reduce(SumReducer, 0);

    const rows = [
      {
        name: 'Fat',
        vpiClass: 'fat', // visual percentage indicator class
        pctg: this.nutrientCalculationService.pctgCalsInFoodForMacro(food, 'Fat'),
        weight: this.nutrientCalculationService.nutrientAmtInFood(food, 'Fat'),
        kcal: this.nutrientCalculationService.calsInFoodForMacro(food, 'Fat')
      },
      {
        name: 'Carbohydrate',
        vpiClass: 'carbs', // visual percentage indicator class
        pctg: this.nutrientCalculationService.pctgCalsInFoodForMacro(food, 'Carbohydrate'),
        weight: this.nutrientCalculationService.nutrientAmtInFood(food, 'Carbohydrate'),
        kcal: this.nutrientCalculationService.calsInFoodForMacro(food, 'Carbohydrate')
      },
      {
        name: 'Protein',
        vpiClass: 'protein', // visual percentage indicator class
        pctg: this.nutrientCalculationService.pctgCalsInFoodForMacro(food, 'Protein'),
        weight: this.nutrientCalculationService.nutrientAmtInFood(food, 'Protein'),
        kcal: this.nutrientCalculationService.calsInFoodForMacro(food, 'Protein')
      },
      {
        name: 'Total',
        pctg: undefined,
        weight: undefined,
        kcal: totalKcals
      },
    ];

    // now multiply values by conversion factor to provided amount and unit
    if (perUnit.abbreviation !== RefUnit.CONSTITUENTS) {
      const convFact = this.newConversionRatioService.convertUnitAmount(food.conversionRatios, 1, this.constituentsUnit, perUnit) * perAmt;
      rows.forEach(row => {
        if (!isNaN(row.weight)) {
          row.weight = row.weight / convFact;
        }
        if (!isNaN(row.kcal)) {
          row.kcal = row.kcal / convFact;
        }
      });
    }

    return rows;
  }

}
