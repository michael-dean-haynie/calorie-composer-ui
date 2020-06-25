import { Injectable } from '@angular/core';
import { NutrientMetaData, NutrientMetadataList } from '../constants/nutrient-metadata';
import { NutrientType } from '../constants/types/nutrient.type';
// import convert from 'convert-units';
// import Qty from 'js-quantities';

@Injectable({
  providedIn: 'root'
})
export class NutrientMetadataService {

  constructor() { }

  aliasToMD(alias: string): NutrientMetaData {
    return NutrientMetadataList
      .find(nutrientMD => nutrientMD.aliases.concat([nutrientMD.nutrient, nutrientMD.displayName]).includes(alias));
  }

  tryAliasToDisplayName(alias: string): string {
    return this.aliasToMD(alias)?.displayName ?? alias;
  }

  aliasToType(alias: string): NutrientType {
    const metaDataMatch = this.aliasToMD(alias);

    if (metaDataMatch === undefined) {
      console.error(`Could not match nutrient alias "${alias}" to a nutrient enum.`);
      alert(`Could not match nutrient alias "${alias}" to a nutrient enum.`);
      return undefined;
    } else {
      return metaDataMatch.nutrient;
    }
  }
}
