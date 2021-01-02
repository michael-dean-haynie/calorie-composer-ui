import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ConversionRatioDTO } from 'src/app/contracts/conversion-ratio-dto';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';
import { Unit } from 'src/app/models/unit.model';
import { UnitMapperService } from '../api/unit-mapper.service';
import { NewConversionRatioService } from '../new-conversion-ratio.service';
import { StandardizedUnitService } from '../util/standardized-unit.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioMapperService {

  constructor(
    private fb: FormBuilder,
    private newConversionRatioService: NewConversionRatioService,
    private standardizedUnitService: StandardizedUnitService,
    private unitMapperService: UnitMapperService
  ) { }

  dtoToModel(conversionRatioDTO: ConversionRatioDTO): ConversionRatio {
    const conversionRatio = new ConversionRatio();
    conversionRatio.id = conversionRatioDTO.id;
    conversionRatio.amountA = conversionRatioDTO.amountA;
    conversionRatio.unitA = this.unitMapperService.dtoToModel(conversionRatioDTO.unitA);
    conversionRatio.freeFormValueA = conversionRatioDTO.freeFormValueA;
    conversionRatio.amountB = conversionRatioDTO.amountB;
    conversionRatio.unitB = this.unitMapperService.dtoToModel(conversionRatioDTO.unitB);
    conversionRatio.freeFormValueB = conversionRatioDTO.freeFormValueB;
    return conversionRatio;
  }

  modelToDTO(conversionRatio: ConversionRatio): ConversionRatioDTO {
    return conversionRatio;
  }

  modelToFormGroup(conversionRatio: ConversionRatio): FormGroup {
    if (!conversionRatio.unitA) {
      conversionRatio.unitA = new Unit();
    }
    if (!conversionRatio.unitB) {
      conversionRatio.unitB = new Unit();
    }

    const result = this.fb.group({
      id: [conversionRatio.id],
      editMode: [false],
      amountA: [conversionRatio.amountA, Validators.required],
      unitA: this.unitMapperService.modelToFormGroup(conversionRatio.unitA),
      freeFormValueA: [conversionRatio.freeFormValueA],
      amountB: [conversionRatio.amountB, Validators.required],
      unitB: this.unitMapperService.modelToFormGroup(conversionRatio.unitB),
      freeFormValueB: [conversionRatio.freeFormValueB]
    },
      {
        validators: [
          this.noConvertingApplesToApples,
          this.noOverridingStandardizedUnitConversions
        ]
      });

    result.get('unitA.abbreviation').setValidators([Validators.required]);
    result.get('unitB.abbreviation').setValidators([Validators.required]);
    return result;
  }

  formGroupToModel(formGroup: FormGroup): ConversionRatio {
    const conversionRatio = new ConversionRatio();
    conversionRatio.id = formGroup.get('id').value;
    conversionRatio.amountA = formGroup.get('amountA').value;
    conversionRatio.unitA = this.unitMapperService.formGroupToModel(formGroup.get('unitA') as FormGroup);
    conversionRatio.freeFormValueA = formGroup.get('freeFormValueA').value;
    conversionRatio.amountB = formGroup.get('amountB').value;
    conversionRatio.unitB = this.unitMapperService.formGroupToModel(formGroup.get('unitB') as FormGroup);
    conversionRatio.freeFormValueB = formGroup.get('freeFormValueB').value;
    return conversionRatio;
  }

  formArrayToModelArray(formArray: FormArray): ConversionRatio[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }



  /**
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  // Conversion must involve 2 different units
  // Converting one amount of apples to another amount of apples is nonsense
  private noConvertingApplesToApples: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const cvRat = this.formGroupToModel(control);

    // can not be certian of units in free form values - in that case disregard
    if (this.newConversionRatioService.usesFreeFormValue(cvRat)) {
      return null;
    }
    // ignore conversionRatios that aren't fully filled out yet
    if (!this.newConversionRatioService.isFilledOut(cvRat)) {
      return null;
    }

    if (cvRat.unitA.matches(cvRat.unitB)) {
      return { noConvertingApplesToApples: 'Cannot convert one amt of a unit to another amt of the same unit. That\'s nonsense.' };
    }
    return null;
  }

  // can't be making 1 mg = 5 g
  private noOverridingStandardizedUnitConversions: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const cvRat = this.formGroupToModel(control);

    // can not be certian of units in free form values - in that case disregard
    if (this.newConversionRatioService.usesFreeFormValue(cvRat)) {
      return null;
    }
    // ignore conversionRatios that aren't fully filled out yet
    if (!this.newConversionRatioService.isFilledOut(cvRat)) {
      return null;
    }

    if (this.standardizedUnitService.unitsHaveStandardizedConversion(cvRat.unitA.abbreviation, cvRat.unitB.abbreviation)) {
      return { noOverridingStandardizedUnitConversions: 'Cannot override standardized unit conversions. C\'mon dude.' };
    }

    return null;
  }
}
