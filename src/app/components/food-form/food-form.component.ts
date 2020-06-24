import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { FoodMapperService } from 'src/app/services/mappers/food-mapper.service';
import { PortionService } from 'src/app/services/util/portion.service';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';
import { FoodValidatorService } from 'src/app/services/validators/food-validator.service';

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
    private foodMapperService: FoodMapperService,
    private foodValidatorService: FoodValidatorService,
    private portionService: PortionService,
    private unitService: UnitService
  ) { }

  ngOnInit(): void {
    // TODO: remove
    this.testThingsOut();

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
    this.foodForm = this.foodMapperService.modelToFormGroup(this.food);
  }

  private mapUnitToAutoCompleteOptions(unit: UnitDescription): any {
    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

  private testThingsOut(): void {
    const food = new Food();
    // food.description = 'hi';
    // const foodFormGroup = this.foodMapperService.modelToFormGroup(food);
    console.log(this.foodValidatorService.isValid(food));

  }
}
