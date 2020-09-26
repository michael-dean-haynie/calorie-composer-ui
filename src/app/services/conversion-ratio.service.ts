import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConversionRatio } from '../models/conversion-ratio.model';
import { ConversionRatioMapperService } from './mappers/conversion-ratio-mapper.service';

export type ConversionRatioSide = 'a' | 'b';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioService {

  constructor(private conversionRatioMapperService: ConversionRatioMapperService) { }

  sideUsesFreeFormValue(cvRat: ConversionRatio, side: ConversionRatioSide): boolean {
    return this.isMeaningfulValue(this.getFreeFormValueForSide(cvRat, side));
  }

  fgSideUsesFreeFormValue(cvRatFG: FormGroup, side: ConversionRatioSide): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.sideUsesFreeFormValue(cvRat, side);
  }

  usesFreeFormValue(cvRat: ConversionRatio): boolean {
    return this.sideUsesFreeFormValue(cvRat, 'a') || this.sideUsesFreeFormValue(cvRat, 'b');
  }

  fgUsesFreeFormValue(cvRatFG: FormGroup): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.usesFreeFormValue(cvRat);
  }

  sideDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    if (this.sideUsesFreeFormValue(cvRat, side)) {
      return this.getFreeFormValueForSide(cvRat, side);
    } else {
      return this.getStructuredDisplayValue(cvRat, side);
    }
  }

  fgSideDisplayValue(cvRatFG: FormGroup, side: ConversionRatioSide): string {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.sideDisplayValue(cvRat, side);
  }


  private getFreeFormValueForSide(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    const map = new Map<ConversionRatioSide, string>([['a', cvRat.freeFormValueA], ['b', cvRat.freeFormValueB]]);
    return map.get(side);
  }

  private getStructuredDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    const amount = side === 'a' ? cvRat.amountA : cvRat.amountB;
    const unit = side === 'a' ? cvRat.unitA : cvRat.unitB;

    return `${amount} ${unit}`;
  }

  private isMeaningfulValue(value): boolean {
    return value !== undefined && value !== null && ('' + value).trim() !== '';
  }

}
