import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutrientDTO } from 'src/app/contracts/nutrient-dto';
import { Nutrient } from 'src/app/models/nutrient.model';
import { NutrientMetadataService } from '../nutrient-metadata.service';

@Injectable({
  providedIn: 'root'
})
export class NutrientMapperService {

  constructor(
    private nutriantMetadataService: NutrientMetadataService,
    private fb: FormBuilder
  ) { }

  dtoToModel(nutrientDTO: NutrientDTO): Nutrient {
    const nutrient = new Nutrient();
    nutrient.id = nutrientDTO.id;
    nutrient.name = this.nutriantMetadataService.aliasToType(nutrientDTO.name);
    nutrient.unit = nutrientDTO.unit;
    nutrient.amount = nutrientDTO.amount;
    return nutrient;
  }

  modelToDTO(nutrient: Nutrient): NutrientDTO {
    return nutrient;
  }

  modelToFormGroup(nutrient: Nutrient): FormGroup {
    return this.fb.group({
      id: [nutrient.id],
      name: [this.nutriantMetadataService.tryAliasToDisplayName(nutrient.name), Validators.required],
      unit: [nutrient.unit, Validators.required],
      amount: [nutrient.amount, Validators.required]
    });
  }

  formGroupToModel(formGroup: FormGroup): Nutrient {
    const nutrient = new Nutrient();
    nutrient.id = formGroup.get('id').value;
    nutrient.name = formGroup.get('name').value;
    nutrient.unit = formGroup.get('unit').value;
    nutrient.amount = formGroup.get('amount').value;
    return nutrient;
  }

  formArrayToModelArray(formArray: FormArray): Nutrient[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }
}
