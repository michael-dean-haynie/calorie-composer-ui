import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComboFoodPortionDTO } from 'src/app/contracts/combo-food-portion-dto';
import { ComboFoodPortion } from 'src/app/models/combo-food-portion.model';
import { PortionService } from '../util/portion.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodPortionMapperService {

  constructor(
    private fb: FormBuilder,
    private portionService: PortionService
  ) { }

  dtoToModel(comboFoodPortionDTO: ComboFoodPortionDTO): ComboFoodPortion {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.id = comboFoodPortionDTO.id;
    comboFoodPortion.isFoodAmountRefPortion = comboFoodPortionDTO.isFoodAmountRefPortion;
    comboFoodPortion.isServingSizePortion = comboFoodPortionDTO.isServingSizePortion;
    comboFoodPortion.metricUnit = comboFoodPortionDTO.metricUnit;
    comboFoodPortion.metricAmount = comboFoodPortionDTO.metricAmount;
    comboFoodPortion.householdMeasure = comboFoodPortionDTO.householdMeasure;
    comboFoodPortion.householdUnit = comboFoodPortionDTO.householdUnit;
    comboFoodPortion.householdAmount = comboFoodPortionDTO.householdAmount;
    return comboFoodPortion;
  }

  modelToDTO(comboFoodPortion: ComboFoodPortion): ComboFoodPortionDTO {
    return comboFoodPortion;
  }

  modelToFormGroup(comboFoodPortion: ComboFoodPortion): FormGroup {
    return this.fb.group({
      id: [comboFoodPortion.id],

      // household measure
      householdMeasureMode: this.portionService.determineHouseholdMeasureMode(comboFoodPortion),
      householdMeasure: [comboFoodPortion.householdMeasure],
      householdUnit: [comboFoodPortion.householdUnit],
      householdAmount: [comboFoodPortion.householdAmount],

      // metric measure
      metricUnit: [this.portionService.determineMetricUnit(comboFoodPortion.metricUnit), Validators.required],
      metricAmount: [comboFoodPortion.metricAmount?.toString() ?? '', Validators.required],

      // flags
      isFoodAmountRefPortion: [comboFoodPortion.isFoodAmountRefPortion],
      isServingSizePortion: [comboFoodPortion.isServingSizePortion],
    });
  }

  formGroupToModel(formGroup: FormGroup): ComboFoodPortion {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.id = formGroup.get('id').value;
    comboFoodPortion.isFoodAmountRefPortion = formGroup.get('isFoodAmountRefPortion').value;
    comboFoodPortion.isServingSizePortion = formGroup.get('isServingSizePortion').value;
    comboFoodPortion.metricUnit = formGroup.get('metricUnit').value;
    comboFoodPortion.metricAmount = formGroup.get('metricAmount').value;
    comboFoodPortion.householdMeasure = formGroup.get('householdMeasure').value;
    comboFoodPortion.householdUnit = formGroup.get('householdUnit').value;
    comboFoodPortion.householdAmount = formGroup.get('householdAmount').value;
    return comboFoodPortion;
  }

  formArrayToModelArray(formArray: FormArray): ComboFoodPortion[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }


  defaultSSModel(): ComboFoodPortion {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.isFoodAmountRefPortion = true;
    comboFoodPortion.isServingSizePortion = true;
    return comboFoodPortion;
  }
}
