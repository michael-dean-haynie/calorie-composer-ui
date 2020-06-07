import { Injectable } from '@angular/core';
import { NutrientEnum } from '../constants/enums/nutrient.enum';
import { NutrientMetadataList } from '../constants/nutrient-metadata';
// import convert from 'convert-units';
// import Qty from 'js-quantities';

@Injectable({
  providedIn: 'root'
})
export class NutrientMetadataService {

  constructor() { }

  aliasToEnum(alias: string): NutrientEnum {
    const metaDataMatch = NutrientMetadataList
      .find(nutrientMD => nutrientMD.aliases.includes(alias));

    if (metaDataMatch === undefined) {
      console.error(`Could not match nutrient alias "${alias}" to a nutrient enum.`);
      return undefined;
    } else {
      return metaDataMatch.nutrient;
    }
  }
}
