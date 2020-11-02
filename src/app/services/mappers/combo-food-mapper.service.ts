import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComboFoodDTO } from 'src/app/contracts/combo-food-dto';
import { ComboFood } from 'src/app/models/combo-food.model';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodMapperService {

  constructor(
    private fb: FormBuilder,
  ) { }

  dtoToModel(comboFoodDTO: ComboFoodDTO): ComboFood {
    const comboFood = new ComboFood();
    comboFood.id = comboFoodDTO.id;
    comboFood.isDraft = comboFoodDTO.isDraft;
    comboFood.description = comboFoodDTO.description;
    return comboFood;
  }

  modelToDTO(comboFood: ComboFood): ComboFoodDTO {
    return comboFood;
  }

  modelToFormGroup(comboFood: ComboFood): FormGroup {
    return this.fb.group({
      id: [comboFood.id],
      isDraft: [comboFood.isDraft],
      description: [comboFood.description, Validators.required],
    }, { validators: [] });
  }

  formGroupToModel(formGroup: FormGroup): ComboFood {
    const comboFood = new ComboFood();
    comboFood.id = formGroup.get('id').value;
    comboFood.isDraft = formGroup.get('isDraft').value;
    comboFood.description = formGroup.get('description').value;
    return comboFood;
  }
}
