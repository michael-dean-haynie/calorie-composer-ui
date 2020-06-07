import { Injectable } from '@angular/core';
import { NutrientDTO } from 'src/app/contracts/nutrient-dto';
import { Nutrient } from 'src/app/models/nutrient.model';
import { NutrientMetadataService } from '../nutrient-metadata.service';

@Injectable({
    providedIn: 'root'
})
export class NutrientMapperService {

    constructor(private nutriantMetadataService: NutrientMetadataService) { }

    dtoToModel(nutrientDTO: NutrientDTO): Nutrient {
        const nutrient = new Nutrient();

        nutrient.nutrient = this.nutriantMetadataService.aliasToEnum(nutrientDTO.name);
        nutrient.unitName = nutrientDTO.unitName;
        nutrient.amount = nutrientDTO.amount;
        return nutrient;
    }
}
