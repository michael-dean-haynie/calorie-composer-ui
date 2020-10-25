import { AfterViewChecked, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { ConstituentType } from 'src/app/constants/types/constituent-type.type';
import { ConversionRatioSide } from 'src/app/constants/types/conversion-ratio-side.type';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { AutoCompleteService } from 'src/app/services/auto-complete.service';
import { ConversionRatioService } from 'src/app/services/conversion-ratio.service';
import { ConversionRatioMapperService } from 'src/app/services/mappers/conversion-ratio-mapper.service';

@Component({
  selector: 'app-conversion-ratios-form',
  templateUrl: './conversion-ratios-form.component.html',
  styleUrls: ['./conversion-ratios-form.component.scss']
})
export class ConversionRatiosFormComponent implements OnInit, AfterViewChecked {

  @Input() conversionRatios: FormArray;
  @Input() constituentType: ConstituentType;

  @ViewChildren(MatExpansionPanel) expansionPanels: QueryList<MatExpansionPanel>;

  constructor(
    private conversionRatioMapperService: ConversionRatioMapperService,
    private conversionRatioService: ConversionRatioService,
    private autoCompleteService: AutoCompleteService,
    private unitPipe: UnitPipe
  ) { }

  ngOnInit(): void {
    // wire up auto complete options
    this.conversionRatios.controls.forEach((cvRat: FormGroup) => this.addFilteredAutoCompleteOptions(cvRat));
  }

  ngAfterViewChecked(): void {
    // Expand empty (newly added) cvRat expansionPanels
    this.expansionPanels.forEach((exp, index) => {
      const cvRat: FormGroup = this.conversionRatios.controls[index] as FormGroup;
      if (!IsMeaningfulValue(cvRat.get('amountA').value)
        && !IsMeaningfulValue(cvRat.get('unitA').value)
        && !IsMeaningfulValue(cvRat.get('amountB').value)
        && !IsMeaningfulValue(cvRat.get('unitB').value)) {
        exp.open();
      }
    });
  }

  /**
   * Check if expansion panel should actually expand/collapse. Undo if nessesary.
   * @param expanding whether the event is from the panel expanding (as opposed to collapsing)
   * @param cvRat the conversion ratio form group
   * @param expPan the expansion panel
   */
  checkExpansion(expanding: boolean, cvRat: FormGroup, expPan: MatExpansionPanel): void {
    if (!expanding && !cvRat.valid) {
      expPan.open();
    }
  }

  /**
   * Checks if a conversion ratio has been touched at the form group level
   * @param cvRat the conversion ratio
   */
  cvRatTouched(cvRat: FormGroup): boolean {
    if (cvRat.get('amountA').touched && cvRat.get('unitA').touched
      && cvRat.get('amountB').touched && cvRat.get('unitB').touched) {
      return true;
    }
    return false;
  }

  /**
   * Returns an array indicating which sides of a conversion ratio are using freeform values
   * @param cvRatFG the conversion ratio
   */
  getSidesUsingFreeFormValue(cvRatFG: FormGroup): ConversionRatioSide[] {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    const result = [];
    if (this.conversionRatioService.sideUsesFreeFormValue(cvRat, 'a')) {
      result.push('a');
    }
    if (this.conversionRatioService.sideUsesFreeFormValue(cvRat, 'b')) {
      result.push('b');
    }
    return result;
  }

  /**
   * Checks if a conversion ratio form group has the nessesary data to be converted from a freeform state
   * @param cvRatFG the conversion ratio
   */
  readyToConvertFromFreeform(cvRatFG: FormGroup): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    const sides = this.getSidesUsingFreeFormValue(cvRatFG);
    return sides.every(side => this.conversionRatioService.sideReadyToConvertFromFreeform(cvRat, side));
  }

  /**
   * Removes free-form values from conversion ratio form group, thereby "converting" it.
   * @param event the triggering event
   * @param cvRatFG the conversion ratio
   */
  convertFromFreeform(event: Event, cvRatFG: FormGroup): void {
    event.stopPropagation();
    cvRatFG.get('freeFormValueA').setValue(null);
    cvRatFG.get('freeFormValueB').setValue(null);
  }

  addConversionRatio(): void {
    const conversionRatioCtrl = this.conversionRatioMapperService.modelToFormGroup(new ConversionRatio());
    this.addFilteredAutoCompleteOptions(conversionRatioCtrl);
    this.conversionRatios.insert(0, conversionRatioCtrl);
  }

  removeConversionRatio(index: number): void {
    this.conversionRatios.removeAt(index);
  }


  /**
   * ----------------------------------------
   * Service pass-throughs
   * ----------------------------------------
   */

  getConversionRatioSideDisplayValue(cvRatFG: FormGroup, side: ConversionRatioSide) {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.conversionRatioService.sideDisplayValue(cvRat, side, this.constituentType);
  }

  usesFreeFormValue(cvRatFG: FormGroup): boolean {
    const cvRat = this.conversionRatioMapperService.formGroupToModel(cvRatFG);
    return this.conversionRatioService.usesFreeFormValue(cvRat);
  }

  /**
   * Returns a function that takes a unit and "pretty prints" it based on constituent type
   * For use with auto complete dropdown options
   */
  get ppConversionRatioUnit() {
    // must curry to introduce the component as the "this" scope
    return (unit: string): string => this.unitPipe.transform(unit, this.constituentType);
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private addFilteredAutoCompleteOptions(cvRat: FormGroup): void {
    const optionsForConversionRatioUnit = this.autoCompleteService.optionsForConversionRatioUnit(this.constituentType);
    cvRat.addControl(
      'unitAFilteredAutoCompleteOptions',
      new FormControl(this.autoCompleteService.filteredOptions(optionsForConversionRatioUnit, cvRat.get('unitA') as FormControl)));
    cvRat.addControl(
      'unitBFilteredAutoCompleteOptions',
      new FormControl(this.autoCompleteService.filteredOptions(optionsForConversionRatioUnit, cvRat.get('unitB') as FormControl)));
  }
}
