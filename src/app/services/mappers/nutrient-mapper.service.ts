import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    nutrient.name = this.nutriantMetadataService.aliasToEnum(nutrientDTO.name);
    nutrient.unitName = nutrientDTO.unitName;
    nutrient.amount = nutrientDTO.amount;
    return nutrient;
  }

  modelToDTO(nutrient: Nutrient): NutrientDTO {
    return nutrient;
  }

  modelToFormGroup(nutrient: Nutrient): FormGroup {
    return this.fb.group({
      editMode: [false],
      name: [nutrient.name],
      unitName: [nutrient.unitName],
      amount: [nutrient.amount]
    });
  }
}
