import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-food-form-conversion-ratio',
  templateUrl: './food-form-conversion-ratio.component.html',
  styleUrls: ['./food-form-conversion-ratio.component.scss']
})
export class FoodFormConversionRatioComponent implements OnInit {

  @Input() foodForm: FormGroup;
  @Input() conversionRatioFormControl: FormGroup;
  @Input() conversionRatiosIndex: number;

  constructor() { }

  ngOnInit(): void {
  }

  get amountA(): number {
    return this.conversionRatioFormControl.get('amountA').value;
  }

  get unitA(): string {
    return this.conversionRatioFormControl.get('unitA').value;
  }

  get freeFormValueA(): string {
    return this.conversionRatioFormControl.get('freeFormValueA').value;
  }

  get amountB(): number {
    return this.conversionRatioFormControl.get('amountB').value;
  }

  get unitB(): string {
    return this.conversionRatioFormControl.get('unitB').value;
  }

  get freeFormValueB(): string {
    return this.conversionRatioFormControl.get('freeFormValueB').value;
  }

  usesFreeFormValueA(): boolean {
    return this.isMeaningfulValue(this.freeFormValueA);
  }

  usesFreeFormValueB(): boolean {
    return this.isMeaningfulValue(this.freeFormValueB);
  }

  usesAFreeFormValue(): boolean {
    return this.usesFreeFormValueA() || this.usesFreeFormValueB();
  }

  private isMeaningfulValue(value): boolean {
    return value !== undefined && value !== null && ('' + value).trim() !== '';
  }

}
