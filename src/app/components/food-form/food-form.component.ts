import { DecimalPipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Path } from 'src/app/constants/types/path.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Opt } from 'src/app/constants/types/select-options';
import { Food } from 'src/app/models/food.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { FdcApiService } from 'src/app/services/api/fdc-api.service';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { ConversionRatioService } from 'src/app/services/conversion-ratio.service';
import { ConversionRatioMapperService } from 'src/app/services/mappers/conversion-ratio-mapper.service';
import { FoodMapperService } from 'src/app/services/mappers/food-mapper.service';
import { NutrientMapperService } from 'src/app/services/mappers/nutrient-mapper.service';
import { ConversionRatiosFormComponent } from '../conversion-ratios-form/conversion-ratios-form.component';
import { NutrientsFormComponent } from '../nutrients-form/nutrients-form.component';

type FormMode = 'create' | 'update' | 'import';

@Component({
  selector: 'app-food-form',
  templateUrl: './food-form.component.html',
  styleUrls: ['./food-form.component.scss']
})
export class FoodFormComponent implements OnInit, OnDestroy {

  @ViewChild(ConversionRatiosFormComponent) conversionRatiosFormComponent: ConversionRatiosFormComponent;
  @ViewChild(NutrientsFormComponent) nutrientsFormComponent: NutrientsFormComponent;

  formMode: FormMode;
  loading = false;

  foodForm: FormGroup;

  ssPaths: Path[] = [];
  ssOpts: Opt[] = [];
  ssSelection: string;

  nrPaths: Path[] = []
  nutrientRefAmt: string;

  private foodId: string;
  private fdcId: string;
  private food: Food;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private foodApiService: FoodApiService,
    private fdcApiService: FdcApiService,
    private foodMapperService: FoodMapperService,
    private nutrientMapperService: NutrientMapperService,
    private conversionRatioMapperService: ConversionRatioMapperService,
    private conversionRatioService: ConversionRatioService,
    private unitPipe: UnitPipe,
    private decimalPipe: DecimalPipe,
    private location: Location,
  ) { }

  ngOnInit(): void {
    // determine form mode and prepare initial food
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.foodId = params['id'];
        this.fdcId = params['fdcId'];

        if (this.foodId !== undefined) {
          this.formMode = 'update';
          this.loadExistingFood();
        }
        else if (this.fdcId !== undefined) {
          this.formMode = 'import';
          this.loadFdcFood();
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

  get conversionRatios(): FormArray {
    return this.foodForm.get('conversionRatios') as FormArray;
  }

  get nutrients(): FormArray {
    return this.foodForm.get('nutrients') as FormArray;
  }

  get ssAmount(): number {
    const path = this.ssPaths.find(pth => this.conversionRatioService.getPathTarget(pth) === this.ssSelection);
    return this.conversionRatioService.getPathProduct(path);
  }

  addNutrient(): void {
    this.nutrientsFormComponent.addNutrient();
  }

  addConversionRatio(): void {
    this.conversionRatiosFormComponent.addConversionRatio();
  }

  cancel(): void {
    this.location.back();
  }

  saveChanges(): void {
    const newFood = this.foodMapperService.formGroupToModel(this.foodForm);

    if (this.formMode === 'create' || this.formMode === 'import') {
      this.foodApiService.post(newFood).subscribe(() => console.log('all done posting!'));
    }
    else if (this.formMode === 'update') {
      this.foodApiService.put(newFood).subscribe(() => console.log('all done updating!'));
    }
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private loadExistingFood(): void {
    this.loading = true;
    this.subscriptions.push(
      this.foodApiService.get(this.foodId).subscribe(food => {
        this.food = food;
        this.loading = false;
        this.prepareFoodForm();
      })
    );
  }

  private loadFdcFood(): void {
    this.loading = true;
    this.subscriptions.push(
      this.fdcApiService.get(this.fdcId).subscribe(food => {
        this.food = food;
        this.loading = false;
        this.prepareFoodForm();
      })
    );
  }

  private prepareNewFood(): void {
    this.food = new Food();
    this.prepareFoodForm();
  }

  private prepareFoodForm(): void {
    this.foodForm = this.foodMapperService.modelToFormGroup(this.food);

    // setup listeners
    this.listenForChangesToConversionRatios();

    // trigger initial value changes
    this.foodForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    // mark all existing fields as touched unless in create mode
    if (this.formMode !== 'create') {
      this.foodForm.markAllAsTouched();
    }
  }

  private listenForChangesToConversionRatios(): void {
    this.subscriptions.push(this.conversionRatios.valueChanges.subscribe(() => {

      // update serving size paths
      const cvRats = this.conversionRatioMapperService.formArrayToModelArray(this.conversionRatios);
      this.ssPaths = this.conversionRatioService.getPathsForUnit(cvRats, RefUnit.SERVING);

      // update serving size units
      this.ssOpts = this.ssPaths.map(ssp => {
        const unit = this.conversionRatioService.getPathTarget(ssp);
        return {
          value: unit,
          label: this.unitPipe.transform(unit, 'nutrient')
        };
      });

      // update selected serving size unit
      if (!this.ssOpts.map(opt => opt.value).includes(this.ssSelection) && this.ssOpts.length) {
        this.ssSelection = this.ssOpts[0].value;
      }

      // update nutrient ref paths
      this.nrPaths = this.conversionRatioService.getPathsForUnit(cvRats, RefUnit.CONSTITUENTS);

      // update nutrientRefAmt (prefer g/ml if possible)
      if (this.nrPaths.length) {
        let nrPath = this.nrPaths.find(path => this.conversionRatioService.getPathTarget(path) === 'g');
        if (!nrPath) {
          nrPath = this.nrPaths.find(path => this.conversionRatioService.getPathTarget(path) === 'ml');
        }
        if (!nrPath) {
          nrPath = this.nrPaths.length ? this.nrPaths[0] : undefined;
        }

        const nrAmount = this.decimalPipe.transform(this.conversionRatioService.getPathProduct(nrPath), '1.0-4');
        const nrUnit = this.conversionRatioService.getPathTarget(nrPath);
        this.nutrientRefAmt = `${nrAmount} ${nrUnit}`;
      }
      else {
        this.nutrientRefAmt = undefined;
      }
    }));
  }
}
