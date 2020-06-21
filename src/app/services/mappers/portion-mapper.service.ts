import { Injectable } from '@angular/core';
import { PortionDTO } from 'src/app/contracts/portion-dto';
import { Portion } from 'src/app/models/portion.model';

@Injectable({
  providedIn: 'root'
})
export class PortionMapperService {

  constructor() { }

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
}
