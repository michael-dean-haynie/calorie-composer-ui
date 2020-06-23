import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseUnitTypes, MassUnits, VolumeUnits } from 'src/app/constants/types/units.type';
import { Food } from 'src/app/models/food.model';
import { Portion } from 'src/app/models/portion.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { PortionService } from 'src/app/services/util/portion.service';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';

type FormMode = 'create' | 'update';

@Component({
  selector: 'app-food-form',
  templateUrl: './food-form.component.html',
  styleUrls: ['./food-form.component.scss']
})
export class FoodFormComponent implements OnInit, OnDestroy {

  formMode: FormMode;
  loading = false;

  foodForm: FormGroup;

  baseUnitTypes = BaseUnitTypes;
  massUnits = MassUnits;
  volumeUnits = VolumeUnits;

  metricMeasureACOptions = [
    {
      groupLabel: 'Mass',
      options: UnitService.MetricMeasureMassUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    },
    {
      groupLabel: 'Volume',
      options: UnitService.MetricMeasureVolumeUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    }
  ];

  private foodId: string;
  private food: Food;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private foodApiService: FoodApiService,
    private portionService: PortionService,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    // determine form mode and initial food
    this.subscriptions.push(
      this.route.params.subscribe(params => {

        this.foodId = params['id'];
        if (this.foodId !== undefined) {
          this.formMode = 'update';
          this.loadExistingFood();
        }
        else {
          this.formMode = 'create';
          this.prepareNewFood();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleHouseholdMeasureMode(): void {
    const modeControl = this.foodForm.get('servingSizePortion.householdMeasureMode');
    modeControl.setValue(modeControl.value === 'unit-amount' ? 'free-form' : 'unit-amount');
  }

  private loadExistingFood(): void {
    this.loading = true;
    this.foodApiService.get(this.foodId).subscribe(food => {
      this.food = food;
      this.loading = false;
      this.prepareFoodForm();
    });
  }

  private prepareNewFood(): void {
    this.food = new Food();
    this.prepareFoodForm();
  }

  private prepareFoodForm(): void {
    const ssp = this.portionService.getServingSize(this.food.portions);


    this.foodForm = this.fb.group({
      description: [this.food.description],
      brandOwner: [this.food.brandOwner],
      ingredients: [this.food.ingredients],
      nutrients: this.fb.array(this.food.nutrients.map(srcNutrient => {
        return this.fb.group({
          nutrient: [srcNutrient.name],
          unitName: [srcNutrient.unitName],
          amount: [srcNutrient.amount]
        });
      })),
      servingSizePortion: this.preparePortionFormGroup(ssp),
      otherPortions: this.fb.array(this.food.portions
        // remove serving size array
        .filter(srcPortion => !srcPortion.isServingSizePortion)
        .map(srcPortion => {
          return this.fb.group({
            baseUnitName: [srcPortion.baseUnitName],
            baseUnitAmount: [srcPortion.baseUnitAmount],
            isNutrientRefPortion: [srcPortion.isNutrientRefPortion],
            isServingSizePortion: [srcPortion.isServingSizePortion],
            description: [srcPortion.description],
            displayUnitName: [srcPortion.displayUnitName],
            displayUnitAmount: [srcPortion.displayUnitAmount],
          });
        })),
    });
  }

  private preparePortionFormGroup(portion: Portion): FormGroup {
    return this.fb.group({

      // household measure
      householdMeasureMode: this.portionService.determineHouseholdMeasureMode(portion),
      description: [portion.description],
      displayUnitName: [portion.displayUnitName],
      displayUnitAmount: [portion.displayUnitAmount],


      // base measure
      baseUnitType: [this.portionService.determineBaseUnitType(portion.baseUnitName)],
      baseUnitName: [this.portionService.determineBaseUnit(portion.baseUnitName)],
      baseUnitAmount: [portion.baseUnitAmount.toString()],

      // flags
      isNutrientRefPortion: [portion.isNutrientRefPortion],
      isServingSizePortion: [portion.isServingSizePortion],
    });
  }

  private mapUnitToAutoCompleteOptions(unit: UnitDescription): any {
    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }
}
