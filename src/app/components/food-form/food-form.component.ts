import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { Path } from 'src/app/constants/types/path.type';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { Opt } from 'src/app/constants/types/select-options';
import { Food } from 'src/app/models/food.model';
import { Unit } from 'src/app/models/unit.model';
import { FdcApiService } from 'src/app/services/api/fdc-api.service';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { AutoCompleteService } from 'src/app/services/auto-complete.service';
import { ConversionRatioMapperService } from 'src/app/services/mappers/conversion-ratio-mapper.service';
import { FoodMapperService } from 'src/app/services/mappers/food-mapper.service';
import { MenuService } from 'src/app/services/menu.service';
import { NewConversionRatioService } from 'src/app/services/new-conversion-ratio.service';
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

  nrPaths: Path[] = [];
  nrOpts: Opt[] = [];

  foodId: string;
  private fdcId: string;
  private food: Food;

  // flag to ignore changes while current request is out, or to avoid cyclic requests
  private ignoreChangesFlag = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private foodApiService: FoodApiService,
    private fdcApiService: FdcApiService,
    private foodMapperService: FoodMapperService,
    private conversionRatioMapperService: ConversionRatioMapperService,
    private newConversionRatioService: NewConversionRatioService,
    private autoCompleteService: AutoCompleteService,
    private menuService: MenuService
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

  get ssrDisplayUnit(): Unit {
    return this.foodForm.get('ssrDisplayUnit').value;
  }

  get ssrDisplayAmount(): number {
    const path = this.ssPaths.find(pth => {
      return this.newConversionRatioService.getPathTarget(pth).matches(this.ssrDisplayUnit);
    });
    return this.newConversionRatioService.getPathProduct(path);
  }

  get csrDisplayUnit(): Unit {
    return this.foodForm.get('csrDisplayUnit').value;
  }

  get csrDisplayAmount(): number {
    const path = this.nrPaths.find(pth => {
      return this.newConversionRatioService.getPathTarget(pth).matches(this.csrDisplayUnit);
    });
    return this.newConversionRatioService.getPathProduct(path);
  }


  addNutrient(): void {
    this.nutrientsFormComponent.addNutrient();
  }

  addConversionRatio(): void {
    this.conversionRatiosFormComponent.addConversionRatio();
  }

  discardChanges(): void {
    this.ignoreChangesFlag = true;
    delete this.food.draft;

    this.foodApiService.put(this.food).subscribe(savedFood => {
      console.log('all done updating!')
      this.ignoreChangesFlag = false;
      this.menuService.updateFoodManagementNavs();
      this.router.navigate(['food-details', this.foodId]);
    });

  }

  autoSave(): void {
    this.ignoreChangesFlag = true;
    const draft = this.foodMapperService.formGroupToModel(this.foodForm);
    this.food.draft = draft;

    this.foodApiService.put(this.food).subscribe(savedFood => {
      console.log('all done updating!')
      this.foodForm.get('id').setValue(savedFood.draft.id);
      this.ignoreChangesFlag = false;
      this.menuService.updateFoodManagementNavs();
    });
  }

  // save draft as actual and discard draft
  saveChanges(): void {
    const food = this.foodMapperService.formGroupToModel(this.foodForm);
    food.isDraft = false;
    food.id = this.food.id

    this.foodApiService.put(food).subscribe(() => {
      console.log('all done updating!');
      this.menuService.updateFoodManagementNavs();
      this.router.navigate(['food-details', this.foodId]);
    });
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
        this.prepareFoodForm();
      })
    );
  }

  private loadFdcFood(): void {
    this.loading = true;
    this.subscriptions.push(
      this.fdcApiService.get(this.fdcId).subscribe(food => {
        this.food = food;
        this.prepareFoodForm();
      })
    );
  }

  private prepareFoodForm(): void {

    if (!this.food.draft) {
      this.food.draft = this.createDraft();
    }
    this.foodForm = this.foodMapperService.modelToFormGroup(this.food.draft);

    // setup listeners
    this.listenForChangesToConversionRatios();

    // trigger initial value changes
    this.foodForm.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    this.foodForm.markAllAsTouched();


    this.autoSaveOnEveryChange(this.foodForm);

    this.loading = false;
  }

  private createDraft(): Food {
    // get seperate copy by mapping to formgroup and back
    const draftFG: FormGroup = this.foodMapperService.modelToFormGroup(this.food);
    const draft: Food = this.foodMapperService.formGroupToModel(draftFG);

    // remove db ids (except for units. those stay)
    delete draft.id;
    draft.isDraft = true;
    draft.conversionRatios.forEach(cvRat => delete cvRat.id);
    draft.nutrients.forEach(nutrient => delete nutrient.id);

    return draft;
  }

  private listenForChangesToConversionRatios(): void {
    this.subscriptions.push(this.conversionRatios.valueChanges.subscribe(() => {

      const servingUnit: Unit = new Unit();
      servingUnit.abbreviation = RefUnit.SERVING;
      const constituentsUnit: Unit = new Unit();
      constituentsUnit.abbreviation = RefUnit.CONSTITUENTS;

      // update serving size paths
      const cvRats = this.conversionRatioMapperService.formArrayToModelArray(this.conversionRatios);
      this.ssPaths = this.newConversionRatioService.getPathsForUnit(cvRats, servingUnit)
        // .filter(ssp => !this.newConversionRatioService.usesFreeFormValue(ssp))
        .filter(ssp => !this.newConversionRatioService.getPathTarget(ssp).matches(constituentsUnit));

      // update serving size display unit options
      this.ssOpts = this.ssPaths.map(ssp => {
        const unit: Unit = this.newConversionRatioService.getPathTarget(ssp);
        return this.autoCompleteService.mapUnitToAutoCompleteOption(unit, 'nutrient');
      });

      // update serving size display unit
      if (!this.ssOpts.map(opt => opt.value).some(unitAbbr => this.ssrDisplayUnit && this.ssrDisplayUnit.abbreviation === unitAbbr)) {
        this.foodForm.get('ssrDisplayUnit.abbreviation').setValue(null);
      }

      // update nutrient ref paths
      this.nrPaths = this.newConversionRatioService.getPathsForUnit(cvRats, constituentsUnit)
        .filter(nrp => !this.newConversionRatioService.getPathTarget(nrp).matches(servingUnit));

      // update nurtient display unit options
      this.nrOpts = this.nrPaths.map(nrp => {
        const unit = this.newConversionRatioService.getPathTarget(nrp);
        return this.autoCompleteService.mapUnitToAutoCompleteOption(unit, 'nutrient');
      });

      // update nutrient display unit
      if (!this.nrOpts.map(opt => opt.value).some(unitAbbr => this.csrDisplayUnit && this.csrDisplayUnit.abbreviation === unitAbbr)) {
        this.foodForm.get('csrDisplayUnit.abbreviation').setValue(null);
      }
    }));
  }

  private autoSaveOnEveryChange(form: FormGroup): void {
    this.subscriptions.push(
      form.valueChanges.pipe(
        filter(() => !this.ignoreChangesFlag),
        debounceTime(500)
      ).subscribe(() => {
        this.autoSave();
      })
    );
  }
}
