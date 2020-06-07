import { Injectable } from '@angular/core';
import { NutrientMetadataList } from '../constants/nutrient-metadata';
import { NutrientType } from '../constants/types/nutrient.type';
// import convert from 'convert-units';
// import Qty from 'js-quantities';

@Injectable({
  providedIn: 'root'
})
export class NutrientMetadataService {

  constructor() { }

  aliasToEnum(alias: string): NutrientType {
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
