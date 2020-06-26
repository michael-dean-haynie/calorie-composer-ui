import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


// A function that takes a value and checks if it passes the mask criteria.
export type MaskCriteria = (value) => boolean;

// Names of mask types provided ootb
export type ProvidedMaskCriteriaName = 'non-negative' | 'float-hundredths';

/**
 * Inspiration: https://stackoverflow.com/a/469362/6137022
 */
@Directive({
  selector: '[appMask]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: MaskDirective,
    multi: true
  }]
})
export class MaskDirective implements ControlValueAccessor {

  // ProvidedMaskCriteriaNames to be applied
  @Input('appMask') providedCriteria: ProvidedMaskCriteriaName[];

  // custom MaskCriteria to be applied
  @Input() customCriteria: MaskCriteria;

  private inputEl: HTMLInputElement;
  private oldValue: string;
  private oldSelectionStart: number;
  private oldSelectionEnd: number;

  // Start ControlValueAccessor fields
  private onChange: (value) => void;
  private onTouched: () => void;
  // End ControlValueAccessor fields

  private providedCriteriaMap = new Map<ProvidedMaskCriteriaName, MaskCriteria>([
    ['non-negative', (value) => /^\d*\.?\d*$/.test(value)],
    ['float-hundredths', (value) => /^-?\d*\.?\d{0,2}$/.test(value)],
  ]);

  constructor(el: ElementRef) {
    this.inputEl = el.nativeElement as HTMLInputElement;
    this.oldValue = this.inputEl.value;
  }

  /**
   * START ControlValueAccessor methods
   */
  writeValue(obj: any): void {
    this.inputEl.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.inputEl.disabled = isDisabled;
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event) {
    this.onTouched();
  }
  /**
   * End ControlValueAccessor methods
   */

  @HostListener('input', ['$event'])
  @HostListener('keydown', ['$event'])
  @HostListener('keyup', ['$event'])
  @HostListener('mousedown', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('select', ['$event'])
  @HostListener('contextmenu', ['$event'])
  @HostListener('drop', ['$event'])
  onValueChange(event: Event) {
    if (this.criteriaAllPass()) {
      this.oldValue = this.inputEl.value;
      this.oldSelectionStart = this.inputEl.selectionStart;
      this.oldSelectionEnd = this.inputEl.selectionEnd;
      this.onChange(this.inputEl.value);
    } else {
      this.inputEl.value = this.oldValue;
      this.inputEl.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
    }
  }

  // combines customCriteria and all providedCriteria in an AND fashion
  private criteriaAllPass(): boolean {
    const criteria: MaskCriteria[] = [];

    // include custom criteria
    if (this.customCriteria) {
      criteria.push(this.customCriteria);
    }

    // include selected provided criteria
    if (this.providedCriteria) {
      this.providedCriteria.forEach(provCritName => {
        const provCrit = this.providedCriteriaMap.get(provCritName);
        if (provCrit) {
          criteria.push(provCrit);
        } else {
          console.error(`Could not find criteria definition for '${provCritName}'`);
        }
      });
    }

    // run all criteria in an AND fashion
    return criteria.every(crit => crit(this.inputEl.value));
  }

}
