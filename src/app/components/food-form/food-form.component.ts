import { Location } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { NutrientMetadataList } from 'src/app/constants/nutrient-metadata';
import { AutoCompleteOptGroup } from 'src/app/constants/types/auto-complete-options.type';
import { ConversionRatioSide } from 'src/app/constants/types/conversion-ratio-side.type';
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
export class FoodFormComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(MatExpansionPanel) expansionPanelsQuery: QueryList<MatExpansionPanel>;
  expansionPanels: MatExpansionPanel[];

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
    private location: Location,
    private fb: FormBuilder
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

  ngAfterViewInit(): void {
    this.expansionPanelsQuery.changes.subscribe((changes: QueryList<MatExpansionPanel>) => {
      this.expansionPanels = changes.toArray();

      // Expand empty (newly added) cvRat expansionPanels
      this.expansionPanels.forEach((exp, index) => {
        const cvRat: FormGroup = this.conversionRatios.controls[index] as FormGroup;

        if (!IsMeaningfulValue(cvRat.get('amountA').value)
          && !IsMeaningfulValue(cvRat.get('unitA').value)
          && !IsMeaningfulValue(cvRat.get('amountB').value)
          && !IsMeaningfulValue(cvRat.get('unitB').value)) {
          exp.open();
        }
      })
    });

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
    this.addFilteredAutoCompleteOptions(conversionRatioCtrl);
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
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.conversionRatioService.sideDisplayValue(cvRat, side, 'nutrient');
  }

  get ppConversionRatioUnit() {
    // must curry to introduce the component as the "this" scope
    return (unit: string): string => this.unitPipe.transform(unit, 'nutrient');
  }

  cvRatTouched(cvRat: FormGroup) {
    if (cvRat.get('amountA').touched && cvRat.get('unitA').touched
      && cvRat.get('amountB').touched && cvRat.get('unitB').touched) {
      return true;
    }
    return false;
  }

  usesFreeFormValue(cvRatFG: FormGroup): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.conversionRatioService.usesFreeFormValue(cvRat);
  }

  getSidesUsingFreeFormValue(cvRatFG: FormGroup): ConversionRatioSide[] {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    const result = [];
    if (this.conversionRatioService.sideUsesFreeFormValue(cvRat, 'a')) {
      result.push('a');
    }
    if (this.conversionRatioService.sideUsesFreeFormValue(cvRat, 'b')) {
      result.push('b');
    }
    return result;
  }

  readyToConvertFromFreeform(cvRatFG: FormGroup): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    const sides = this.getSidesUsingFreeFormValue(cvRatFG);
    return sides.every(side => this.conversionRatioService.sideReadyToConvertFromFreeform(cvRat, side));
  }

  convertFromFreeform(event: Event, cvRatFG: FormGroup) {
    event.stopPropagation();
    cvRatFG.get('freeFormValueA').setValue(null);
    cvRatFG.get('freeFormValueB').setValue(null);
  }


  // check if it should actually expand. stop if nessesary
  checkExpansion(expanding: boolean, cvRat: FormGroup, expPan: MatExpansionPanel): void {
    if (!expanding && !cvRat.valid) {
      expPan.open();
    }
  }

  private filteredOptions(optionGroups: AutoCompleteOptGroup[], input: FormControl): Observable<AutoCompleteOptGroup[]> {
    return input.valueChanges.pipe(
      startWith(''), // so AC pops up initially
      map(inputVal => {

        if (!IsMeaningfulValue(inputVal)) {
          return optionGroups;
        }

        return optionGroups.map(group => {
          // remove options in group that don't match filter value
          // also - don't dork with original list.
          const shallowGroupClone = { ...group };
          shallowGroupClone.groupOptions = group.groupOptions.filter(opt => {
            return opt.label.toLowerCase().includes(inputVal.toLowerCase());
          });
          return shallowGroupClone;
        });
      })
    );
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
      })
    );

    // add filtered autocomplete options obs
    this.conversionRatios.controls.forEach((cvRat: FormGroup) => this.addFilteredAutoCompleteOptions(cvRat));

    // trigger initial value changes
    this.foodForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });

    // mark all existing fields as touched unless in create mode
    if (this.formMode !== 'create') {
      this.foodForm.markAllAsTouched();
    }
  }

  private addFilteredAutoCompleteOptions(cvRat: FormGroup): void {
    cvRat.addControl(
      'unitAFilteredAutoCompleteOptions',
      this.fb.control(this.filteredOptions(this.conversionRatioUnitACOptions, cvRat.get('unitA') as FormControl)));
    cvRat.addControl(
      'unitBFilteredAutoCompleteOptions',
      this.fb.control(this.filteredOptions(this.conversionRatioUnitACOptions, cvRat.get('unitB') as FormControl)));
  }
}
