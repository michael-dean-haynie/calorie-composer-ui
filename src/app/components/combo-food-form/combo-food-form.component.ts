import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComboFoodPortion } from 'src/app/models/combo-food-portion.model';
import { ComboFood } from 'src/app/models/combo-food.model';
import { ComboFoodApiService } from 'src/app/services/api/combo-food-api.service';
import { ComboFoodMapperService } from 'src/app/services/mappers/combo-food-mapper.service';
import { ComboFoodPortionMapperService } from 'src/app/services/mappers/combo-food-portion-mapper.service';

type FormMode = 'create' | 'update';

@Component({
  selector: 'app-combo-food-form',
  templateUrl: './combo-food-form.component.html',
  styleUrls: ['./combo-food-form.component.scss']
})
export class ComboFoodFormComponent implements OnInit, OnDestroy {

  formMode: FormMode;
  loading = false;

  comboFoodForm: FormGroup;

  comboFoodId: string;
  comboFood: ComboFood;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private comboFoodApiService: ComboFoodApiService,
    private comboFoodMapperService: ComboFoodMapperService,
    private comboFoodPortionMapperService: ComboFoodPortionMapperService
  ) { }

  ngOnInit(): void {
    // determine form mode and prepare initial combo food
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        this.comboFoodId = params['id'];

        if (this.comboFoodId !== undefined) {
          this.formMode = 'update';
          this.loadExistingComboFood();
        }
        else {
          this.formMode = 'create';
          this.prepareNewComboFood();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get otherPortions(): FormArray {
    return this.comboFoodForm.get('otherPortions') as FormArray;
  }

  addNonSSPortion(): void {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.isServingSizePortion = false;
    comboFoodPortion.isFoodAmountRefPortion = false;
    this.otherPortions.push(this.comboFoodPortionMapperService.modelToFormGroup(comboFoodPortion));
  }

  private loadExistingComboFood(): void {
    this.loading = true;
    this.comboFoodApiService.get(this.comboFoodId).subscribe(comboFood => {
      this.comboFood = comboFood;
      this.loading = false;
      this.prepareComboFoodForm();
    });
  }

  private prepareNewComboFood(): void {
    this.comboFood = new ComboFood();
    this.prepareComboFoodForm();
  }

  private prepareComboFoodForm(): void {
    this.comboFoodForm = this.comboFoodMapperService.modelToFormGroup(this.comboFood);
  }

}
