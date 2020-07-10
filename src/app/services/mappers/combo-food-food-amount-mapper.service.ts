import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComboFoodFoodAmountDTO } from 'src/app/contracts/combo-food-food-amount-dto';
import { ComboFoodFoodAmount } from 'src/app/models/combo-food-food-amount.model';
import { FoodMapperService } from './food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodFoodAmountMapperService {

  constructor(
    private foodMapperService: FoodMapperService,
    private fb: FormBuilder
  ) { }

  dtoToModel(comboFoodFoodAmountDTO: ComboFoodFoodAmountDTO): ComboFoodFoodAmount {
    const comboFoodFoodAmount = new ComboFoodFoodAmount();
    comboFoodFoodAmount.id = comboFoodFoodAmountDTO.id;
    comboFoodFoodAmount.food = this.foodMapperService.dtoToModel(comboFoodFoodAmountDTO.food);
    comboFoodFoodAmount.unit = comboFoodFoodAmountDTO.unit;
    comboFoodFoodAmount.amount = comboFoodFoodAmountDTO.amount;
    return comboFoodFoodAmount;
  }

  modelToDTO(comboFoodFoodAmount: ComboFoodFoodAmount): ComboFoodFoodAmountDTO {
    return comboFoodFoodAmount;
  }

  modelToFormGroup(comboFoodFoodAmount: ComboFoodFoodAmount): FormGroup {
    return this.fb.group({
      id: [comboFoodFoodAmount.id],
      foodName: [''],
      food: [comboFoodFoodAmount.food, Validators.required],
      unit: [comboFoodFoodAmount.unit, Validators.required],
      amount: [comboFoodFoodAmount.amount, Validators.required]
    });
  }

  formGroupToModel(formGroup: FormGroup): ComboFoodFoodAmount {
    const comboFoodFoodAmount = new ComboFoodFoodAmount();
    comboFoodFoodAmount.id = formGroup.get('id').value;
    comboFoodFoodAmount.food = formGroup.get('food').value;
    comboFoodFoodAmount.unit = formGroup.get('unit').value;
    comboFoodFoodAmount.amount = formGroup.get('amount').value;
    return comboFoodFoodAmount;
  }

  formArrayToModelArray(formArray: FormArray): ComboFoodFoodAmount[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }

  defaultModel(): ComboFoodFoodAmount {
    return new ComboFoodFoodAmount();
  }
}
