import { Injectable } from '@angular/core';
import { ConversionRatioMapperService } from '../mappers/conversion-ratio-mapper.service';
import { NewConversionRatioService } from '../new-conversion-ratio.service';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioValidatorService {

  constructor(
    private conversionRatioMapperService: ConversionRatioMapperService,
    private newConversionRatioService: NewConversionRatioService
  ) { }

  /**
   * ------------------------------
   * Array
   * ------------------------------
   */



  /**
   * ------------------------------
   * Single
   * ------------------------------
   */

}
