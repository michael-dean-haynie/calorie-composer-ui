import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { FoodMapperService } from 'src/app/services/mappers/food-mapper.service';

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

  private foodId: string;
  private food: Food;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private foodApiService: FoodApiService,
    private foodMapperService: FoodMapperService
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

  get otherPortions(): FormArray {
    return this.foodForm.get('otherPortions') as FormArray;
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
}
