import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ConversionRatioDTO } from 'src/app/contracts/conversion-ratio-dto';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioMapperService {

  constructor(
    private fb: FormBuilder
  ) { }

  dtoToModel(conversionRatioDTO: ConversionRatioDTO): ConversionRatio {
    const conversionRatio = new ConversionRatio();
    conversionRatio.id = conversionRatioDTO.id;
    conversionRatio.amountA = conversionRatioDTO.amountA;
    conversionRatio.unitA = conversionRatioDTO.unitA;
    conversionRatio.freeFormValueA = conversionRatioDTO.freeFormValueA;
    conversionRatio.amountB = conversionRatioDTO.amountB;
    conversionRatio.unitB = conversionRatioDTO.unitB;
    conversionRatio.freeFormValueB = conversionRatioDTO.freeFormValueB;
    return conversionRatio;
  }

  modelToDTO(conversionRatio: ConversionRatio): ConversionRatioDTO {
    return conversionRatio;
  }

  modelToFormGroup(conversionRatio: ConversionRatio): FormGroup {
    return this.fb.group({
      id: [conversionRatio.id],
      editMode: [false],
      amountA: [conversionRatio.amountA],
      unitA: [conversionRatio.unitA],
      freeFormValueA: [conversionRatio.freeFormValueA],
      amountB: [conversionRatio.amountB],
      unitB: [conversionRatio.unitB],
      freeFormValueB: [conversionRatio.freeFormValueB]
    });
  }

  formGroupToModel(formGroup: FormGroup): ConversionRatio {
    const conversionRatio = new ConversionRatio();
    conversionRatio.id = formGroup.get('id').value;
    conversionRatio.amountA = formGroup.get('amountA').value;
    conversionRatio.unitA = formGroup.get('unitA').value;
    conversionRatio.freeFormValueA = formGroup.get('freeFormValueA').value;
    conversionRatio.amountB = formGroup.get('amountB').value;
    conversionRatio.unitB = formGroup.get('unitB').value;
    conversionRatio.freeFormValueB = formGroup.get('freeFormValueB').value;
    return conversionRatio;
  }

  formArrayToModelArray(formArray: FormArray): ConversionRatio[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }
}
