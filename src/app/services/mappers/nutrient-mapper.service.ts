import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NutrientDTO } from 'src/app/contracts/nutrient-dto';
import { Nutrient } from 'src/app/models/nutrient.model';
import { UnitMapperService } from '../api/unit-mapper.service';
import { NutrientMetadataService } from '../nutrient-metadata.service';

@Injectable({
  providedIn: 'root'
})
export class NutrientMapperService {

  constructor(
    private nutriantMetadataService: NutrientMetadataService,
    private unitMapperService: UnitMapperService,
    private fb: FormBuilder
  ) { }

  dtoToModel(nutrientDTO: NutrientDTO): Nutrient {
    const nutrient = new Nutrient();
    nutrient.id = nutrientDTO.id;
    nutrient.name = this.nutriantMetadataService.aliasToType(nutrientDTO.name);
    nutrient.unit = this.unitMapperService.dtoToModel(nutrientDTO.unit);
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
      unit: this.unitMapperService.modelToFormGroup(nutrient.unit), // TODO: make required
      amount: [nutrient.amount, Validators.required]
    });
  }

  formGroupToModel(formGroup: FormGroup): Nutrient {
    const nutrient = new Nutrient();
    nutrient.id = formGroup.get('id').value;
    nutrient.name = formGroup.get('name').value;
    nutrient.unit = this.unitMapperService.formGroupToModel(formGroup.get('unit') as FormGroup);
    nutrient.amount = formGroup.get('amount').value;
    return nutrient;
  }

  formArrayToModelArray(formArray: FormArray): Nutrient[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }
}
