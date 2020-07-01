import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    portion.metricAmount = portionDTO.metricAmount;
    portion.isNutrientRefPortion = portionDTO.isNutrientRefPortion;
    portion.isServingSizePortion = portionDTO.isServingSizePortion;
    portion.householdMeasure = portionDTO.householdMeasure;
    portion.householdUnit = portionDTO.householdUnit;
    portion.householdAmount = portionDTO.householdAmount;
    return portion;
  }

  modelToDTO(portion: Portion): PortionDTO {
    return portion;
  }

  modelToFormGroup(portion: Portion): FormGroup {
    return this.fb.group({

      // household measure
      householdMeasureMode: this.portionService.determineHouseholdMeasureMode(portion),
      householdMeasure: [portion.householdMeasure],
      householdUnit: [portion.householdUnit],
      householdAmount: [portion.householdAmount],

      // base measure
      metricUnit: [this.portionService.determineMetricUnit(portion.metricUnit), Validators.required],
      metricAmount: [portion.metricAmount?.toString() ?? '', Validators.required],

      // flags
      isNutrientRefPortion: [portion.isNutrientRefPortion],
      isServingSizePortion: [portion.isServingSizePortion],
    });
  }

  defaultSSModel(): Portion {
    const portion = new Portion();
    portion.isNutrientRefPortion = true;
    portion.isServingSizePortion = true;
    return portion;
  }
}
