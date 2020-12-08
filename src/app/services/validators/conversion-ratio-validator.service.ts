import { Injectable } from '@angular/core';
import { FormArray, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ContradictionsResult } from 'src/app/constants/types/contradictions-result.type';
import { ConversionRatioService } from '../conversion-ratio.service';
import { ConversionRatioMapperService } from '../mappers/conversion-ratio-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioValidatorService {

  constructor(
    private conversionRatioMapperService: ConversionRatioMapperService,
    private conversionRatioService: ConversionRatioService
  ) { }

  //  can not have more than one conversion ratio going from mass to volume
  //     or the like for any 2 measures
  //     take into account "built up" or "indirect" conversion ratios: i.e. 32 g = 1 serving size = 1 serving size = 2 Tbsp
  //                                                                        32 g = 2 Tbsp
  //                                                                        mass -> volume
  noContradictingOtherConversionRatios: ValidatorFn = (control: FormArray): ValidationErrors | null => {
    const conversionRatios = this.conversionRatioMapperService.formArrayToModelArray(control)
      .filter(cvRat => !this.conversionRatioService.usesFreeFormValue(cvRat))
      .filter(cvRat => this.conversionRatioService.isFilledOut(cvRat));

    const result: ContradictionsResult = this.conversionRatioService.checkForContradictions(conversionRatios, 'nutrient');
    if (result.contradictionsExist) {
      return { noContradictingOtherConversionRatios: result };
    }
    return null;
  }
}
