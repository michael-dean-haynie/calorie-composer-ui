import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NutrientMetadataList } from 'src/app/constants/nutrient-metadata';
import { AutoCompleteOptGroup } from 'src/app/constants/types/auto-complete-options.type';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';
import { Food } from 'src/app/models/food.model';
import { Nutrient } from 'src/app/models/nutrient.model';
import { Portion } from 'src/app/models/portion.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { FdcApiService } from 'src/app/services/api/fdc-api.service';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { ConversionRatioService } from 'src/app/services/conversion-ratio.service';
import { ConversionRatioMapperService } from 'src/app/services/mappers/conversion-ratio-mapper.service';
import { FoodMapperService } from 'src/app/services/mappers/food-mapper.service';
import { NutrientMapperService } from 'src/app/services/mappers/nutrient-mapper.service';
import { PortionMapperService } from 'src/app/services/mappers/portion-mapper.service';
import { NutrientMetadataService } from 'src/app/services/nutrient-metadata.service';
import { UnitService } from 'src/app/services/util/unit.service';

type FormMode = 'create' | 'update' | 'import';

@Component({
  selector: 'app-food-form',
  templateUrl: './food-form.component.html',
  styleUrls: ['./food-form.component.scss']
})
export class FoodFormComponent implements OnInit, OnDestroy {

  formMode: FormMode;
  loading = false;

  foodForm: FormGroup;

  conversionRatiosDisplayedColumns = ['sideA', 'equals', 'sideB', 'icons'];
  conversionRatiosDataSource: BehaviorSubject<any> = new BehaviorSubject([]);

  conversionRatioUnitACOptions: AutoCompleteOptGroup[] = [
    {
      groupLabel: 'Mass',
      groupOptions: UnitService.MetricMassUnits.concat(UnitService.ImperialMassUnits)
        .map(unit => this.unitService.mapUnitToAutoCompleteOptions(unit, 'nutrient'))
    },
    {
      groupLabel: 'Volume',
      groupOptions: UnitService.MetricVolumeUnits.concat(UnitService.ImperialVolumeUnits)
        .map(unit => this.unitService.mapUnitToAutoCompleteOptions(unit, 'nutrient'))
    },
    {
      groupLabel: 'Reference',
      groupOptions: UnitService.ReferenceMeasureUnits
        .map(unit => this.unitService.mapUnitToAutoCompleteOptions(unit, 'nutrient'))
    }
  ];

  nutrientsDisplayedColumns = ['name', 'amount', 'unit', 'icons'];
  nutrientsDataSource: BehaviorSubject<any> = new BehaviorSubject([]);

  nutrientUnitACOptions = UnitService.NutrientUnits.map(desc => ({ label: `${desc.singular} (${desc.abbr})`, value: desc.abbr }));
  nutrientNameACOptions = NutrientMetadataList.map(meta => meta.displayName);

  private foodId: string;
  private fdcId: string;
  private food: Food;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private foodApiService: FoodApiService,
    private fdcApiService: FdcApiService,
    private foodMapperService: FoodMapperService,
    private portionMapperService: PortionMapperService,
    private unitService: UnitService,
    private nutrientMetadataService: NutrientMetadataService,
    private nutrientMapperService: NutrientMapperService,
    private conversionRatioMapperService: ConversionRatioMapperService,
    private conversionRatioService: ConversionRatioService,
    private unitPipe: UnitPipe,
    private location: Location
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

  get aNutrientIsBeingEdited(): boolean {
    const nutrients = this.foodForm.get('nutrients') as FormArray;
    return nutrients.controls.some(ctrl => ctrl.get('editMode').value);
  }

  addNonSSPortion(): void {
    const portion = new Portion();
    portion.isServingSizePortion = false;
    portion.isNutrientRefPortion = false;
    this.conversionRatios.push(this.portionMapperService.modelToFormGroup(portion));
  }

  /**
   * nutrient table add/remove/toggle
   */

  addNutrient(): void {
    const nutrientCtrl = this.nutrientMapperService.modelToFormGroup(new Nutrient());
    nutrientCtrl.get('editMode').setValue(true);
    this.nutrients.insert(0, nutrientCtrl);
  }

  toggleNutrientEditMode(nutrient: FormGroup): void {
    nutrient.get('editMode').setValue(!nutrient.get('editMode').value);
  }

  removeNutrient(index: number): void {
    this.nutrients.removeAt(index);
  }

  /**
   * conversion ratio table add/remove/toggle
   */

  addConversionRatio(): void {
    const conversionRatioCtrl = this.conversionRatioMapperService.modelToFormGroup(new ConversionRatio());
    conversionRatioCtrl.get('editMode').setValue(true);
    this.conversionRatios.insert(0, conversionRatioCtrl);
  }

  toggleConversionRatioEditMode(conversionRatio: FormGroup): void {
    conversionRatio.get('editMode').setValue(!conversionRatio.get('editMode').value);
  }

  removeConversionRatio(index: number): void {
    this.conversionRatios.removeAt(index);
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

  getConversionRatioSideDisplayValue(cvRatFG, side) {
    return this.conversionRatioService.fgSideDisplayValue(cvRatFG, side, 'nutrient');
  }

  get ppConversionRatioUnit() {
    // must curry to introduce the component as the "this" scope
    return (unit: string): string => this.unitPipe.transform(unit, 'nutrient');
  }

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
    this.subscriptions.push(
      this.foodForm.valueChanges.subscribe(() => {

        // inject nutrient index into nutrient form groups and push to data source
        const nutrients = this.foodForm.get('nutrients') as FormArray;
        this.nutrientsDataSource.next(nutrients.controls.map((nutrient: FormGroup, index: number) => {
          const existingIndexControl = nutrient.get('nutrientIndex');
          if (existingIndexControl) {
            // avoid recursive change detection - nice.
            if ((existingIndexControl.value + 0) !== index) {
              nutrient.get('nutrientIndex').setValue(index);
            }
          } else {
            nutrient.addControl('nutrientIndex', new FormControl(index));
          }
          return nutrient;
        }));

        // inject conversion ratio index into conversion ratio form groups and push to data source
        const conversionRatios = this.foodForm.get('conversionRatios') as FormArray;
        this.conversionRatiosDataSource.next(conversionRatios.controls.map((cvRat: FormGroup, index: number) => {
          const existingIndexControl = cvRat.get('conversionRatioIndex');
          if (existingIndexControl) {
            // avoid recursive change detection - nice.
            if ((existingIndexControl.value + 0) !== index) {
              cvRat.get('conversionRatioIndex').setValue(index);
            }
          } else {
            cvRat.addControl('conversionRatioIndex', new FormControl(index));
          }
          return cvRat;
        }));
      })
    );

    // trigger initial value changes
    this.foodForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    // mark as touched if import mode
    if (this.formMode === 'import') {
      this.foodForm.markAllAsTouched();
    }
  }
}
