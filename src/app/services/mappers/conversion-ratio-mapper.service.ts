import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ConversionRatioDTO } from 'src/app/contracts/conversion-ratio-dto';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';
import { ConversionRatioService } from '../conversion-ratio.service';
import { UnitService } from '../util/unit.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioMapperService {

  constructor(
    private fb: FormBuilder,
    private conversionRatioService: ConversionRatioService,
    private unitService: UnitService
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
      amountA: [conversionRatio.amountA, Validators.required],
      unitA: [conversionRatio.unitA, Validators.required],
      freeFormValueA: [conversionRatio.freeFormValueA],
      amountB: [conversionRatio.amountB, Validators.required],
      unitB: [conversionRatio.unitB, Validators.required],
      freeFormValueB: [conversionRatio.freeFormValueB]
    },
      { validators: [this.noConvertingApplesToApples, this.noOverridingStandardizedUnitConversions] });
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

  /**
   * Validation
   */

  // Conversion must involve 2 different units
  // Converting one amount of apples to another amount of apples is nonsense
  private noConvertingApplesToApples: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const cvRat = this.formGroupToModel(control);

    // can not be certian of units in free form values - in that case disregard
    if (this.conversionRatioService.usesFreeFormValue(cvRat)) {
      return null;
    }

    // ignore conversionRatios that aren't fully filled out yet
    if (!this.conversionRatioService.isFilledOut(cvRat)) {
      return null;
    }

    if (cvRat.unitA === cvRat.unitB) {
      return { noConvertingApplesToApples: 'Cannot convert one amt of a unit to another amt of the same unit. That\'s nonsense.' };
    }
  }

  // can't be making 1 mg = 5 g
  private noOverridingStandardizedUnitConversions: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const cvRat = this.formGroupToModel(control);
    const error = { noOverridingStandardizedUnitConversions: 'Cannot override standardized unit conversions. C\'mon dude.' };

    if (this.unitService.unitsHaveStandardizedConversion(cvRat.unitA, cvRat.unitB)) {
      return error;
    }

    return null;
  }
}
