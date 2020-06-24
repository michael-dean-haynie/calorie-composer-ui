import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    portion.baseUnitName = portionDTO.baseUnitName;
    portion.baseUnitAmount = portionDTO.baseUnitAmount;
    portion.isNutrientRefPortion = portionDTO.isNutrientRefPortion;
    portion.isServingSizePortion = portionDTO.isServingSizePortion;
    portion.description = portionDTO.description;
    portion.displayUnitName = portionDTO.displayUnitName;
    portion.displayUnitAmount = portionDTO.displayUnitAmount;
    return portion;
  }

  modelToDTO(portion: Portion): PortionDTO {
    return portion;
  }

  modelToFormGroup(portion: Portion): FormGroup {
    return this.fb.group({

      // household measure
      householdMeasureMode: this.portionService.determineHouseholdMeasureMode(portion),
      description: [portion.description],
      displayUnitName: [portion.displayUnitName],
      displayUnitAmount: [portion.displayUnitAmount],

      // base measure
      baseUnitName: [this.portionService.determineBaseUnit(portion.baseUnitName)],
      baseUnitAmount: [portion.baseUnitAmount?.toString() ?? ''],

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
