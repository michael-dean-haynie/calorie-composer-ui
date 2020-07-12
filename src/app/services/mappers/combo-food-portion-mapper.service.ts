import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
    comboFoodPortion.metricScalar = comboFoodPortionDTO.metricScalar;
    comboFoodPortion.householdUnit = comboFoodPortionDTO.householdUnit;
    comboFoodPortion.householdScalar = comboFoodPortionDTO.householdScalar;
    return comboFoodPortion;
  }

  modelToDTO(comboFoodPortion: ComboFoodPortion): ComboFoodPortionDTO {
    return comboFoodPortion;
  }

  modelToFormGroup(comboFoodPortion: ComboFoodPortion): FormGroup {
    return this.fb.group({
      id: [comboFoodPortion.id],

      // household measure
      householdUnit: [comboFoodPortion.householdUnit],
      householdScalar: [comboFoodPortion.householdScalar],

      // metric measure
      metricUnit: [this.portionService.determineMetricUnit(comboFoodPortion.metricUnit)],
      metricScalar: [comboFoodPortion.metricScalar?.toString() ?? ''],

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
    comboFoodPortion.metricScalar = formGroup.get('metricScalar').value;
    comboFoodPortion.householdUnit = formGroup.get('householdUnit').value;
    comboFoodPortion.householdScalar = formGroup.get('householdScalar').value;
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
