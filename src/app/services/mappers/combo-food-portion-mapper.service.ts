import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  defaultSSModel(): ComboFoodPortion {
    const comboFoodPortion = new ComboFoodPortion();
    comboFoodPortion.isFoodAmountRefPortion = true;
    comboFoodPortion.isServingSizePortion = true;
    return comboFoodPortion;
  }
}
