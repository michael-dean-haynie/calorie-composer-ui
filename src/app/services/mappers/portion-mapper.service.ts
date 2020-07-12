import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PortionDTO } from 'src/app/contracts/portion-dto';
import { Portion } from 'src/app/models/portion.model';
import { PortionService } from '../util/portion.service';

@Injectable({
  providedIn: 'root'
})
export class PortionMapperService {

  constructor(
    private fb: FormBuilder,
    private portionService: PortionService
  ) { }

  dtoToModel(portionDTO: PortionDTO): Portion {
    const portion = new Portion();
    portion.id = portionDTO.id;
    portion.metricUnit = portionDTO.metricUnit;
    portion.metricScalar = portionDTO.metricScalar;
    portion.isNutrientRefPortion = portionDTO.isNutrientRefPortion;
    portion.isServingSizePortion = portionDTO.isServingSizePortion;
    portion.householdMeasure = portionDTO.householdMeasure;
    portion.householdUnit = portionDTO.householdUnit;
    portion.householdScalar = portionDTO.householdScalar;
    return portion;
  }

  modelToDTO(portion: Portion): PortionDTO {
    return portion;
  }

  modelToFormGroup(portion: Portion): FormGroup {
    return this.fb.group({
      id: [portion.id],

      // household measure
      householdMeasureMode: this.portionService.determineHouseholdMeasureMode(portion),
      householdMeasure: [portion.householdMeasure],
      householdUnit: [portion.householdUnit],
      householdScalar: [portion.householdScalar],

      // metric measure
      metricUnit: [this.portionService.determineMetricUnit(portion.metricUnit), Validators.required],
      metricScalar: [portion.metricScalar?.toString() ?? '', Validators.required],

      // flags
      isNutrientRefPortion: [portion.isNutrientRefPortion],
      isServingSizePortion: [portion.isServingSizePortion],
    });
  }

  formGroupToModel(formGroup: FormGroup): Portion {
    const portion = new Portion();
    portion.id = formGroup.get('id').value;
    portion.isNutrientRefPortion = formGroup.get('isNutrientRefPortion').value;
    portion.isServingSizePortion = formGroup.get('isServingSizePortion').value;
    portion.metricUnit = formGroup.get('metricUnit').value;
    portion.metricScalar = formGroup.get('metricScalar').value;
    portion.householdMeasure = formGroup.get('householdMeasure').value;
    portion.householdUnit = formGroup.get('householdUnit').value;
    portion.householdScalar = formGroup.get('householdScalar').value;
    return portion;
  }

  formArrayToModelArray(formArray: FormArray): Portion[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }

  defaultSSModel(): Portion {
    const portion = new Portion();
    portion.isNutrientRefPortion = true;
    portion.isServingSizePortion = true;
    return portion;
  }
}
