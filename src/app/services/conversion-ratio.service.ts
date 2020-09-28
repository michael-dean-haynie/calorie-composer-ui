import { Injectable } from '@angular/core';
import { ConstituentType } from '../constants/types/constituent-type.type';
import { ConversionRatioSide } from '../constants/types/conversion-ratio-side.type';
import { ConversionRatio } from '../models/conversion-ratio.model';
import { UnitPipe } from '../pipes/unit.pipe';

@Injectable({
  providedIn: 'root'
})
export class ConversionRatioService {

  constructor(
    private unitPipe: UnitPipe
  ) { }

  sideUsesFreeFormValue(cvRat: ConversionRatio, side: ConversionRatioSide): boolean {
    return this.isMeaningfulValue(this.getFreeFormValueForSide(cvRat, side));
  }

  usesFreeFormValue(cvRat: ConversionRatio): boolean {
    return this.sideUsesFreeFormValue(cvRat, 'a') || this.sideUsesFreeFormValue(cvRat, 'b');
  }

  sideDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide, constituentType: ConstituentType): string {
    if (this.sideUsesFreeFormValue(cvRat, side)) {
      return this.getFreeFormValueForSide(cvRat, side);
    } else {
      return this.getStructuredDisplayValue(cvRat, side, constituentType);
    }
  }

  private getFreeFormValueForSide(cvRat: ConversionRatio, side: ConversionRatioSide): string {
    const map = new Map<ConversionRatioSide, string>([['a', cvRat.freeFormValueA], ['b', cvRat.freeFormValueB]]);
    return map.get(side);
  }

  private getStructuredDisplayValue(cvRat: ConversionRatio, side: ConversionRatioSide, constituentType: ConstituentType): string {
    const amount = side === 'a' ? cvRat.amountA : cvRat.amountB;
    const unit = side === 'a' ? cvRat.unitA : cvRat.unitB;

    return `${amount} ${this.unitPipe.transform(unit, constituentType)}`;
  }

  private isMeaningfulValue(value): boolean {
    return value !== undefined && value !== null && ('' + value).trim() !== '';
  }

}