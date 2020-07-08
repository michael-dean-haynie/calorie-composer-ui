import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Food } from 'src/app/models/food.model';
import { FoodMapperService } from '../mappers/food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodValidatorService {

  constructor(
    private foodMapperService: FoodMapperService
  ) { }

  public isValid(food: Food): boolean {
    const formGroup: FormGroup = this.foodMapperService.modelToFormGroup(food);
    formGroup.markAllAsTouched();
    return formGroup.valid;
  }
}
