import { AfterViewChecked, Component, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subscription } from 'rxjs';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { ConstituentType } from 'src/app/constants/types/constituent-type.type';
import { ConversionRatioSide } from 'src/app/constants/types/conversion-ratio-side.type';
import { Opt } from 'src/app/constants/types/select-options';
import { ConversionRatio } from 'src/app/models/conversion-ratio.model';
import { Unit } from 'src/app/models/unit.model';
import { UnitPipe } from 'src/app/pipes/unit.pipe';
import { UnitApiService } from 'src/app/services/api/unit-api.service';
import { UnitMapperService } from 'src/app/services/api/unit-mapper.service';
import { AutoCompleteService } from 'src/app/services/auto-complete.service';
import { ConversionRatioService } from 'src/app/services/conversion-ratio.service';
import { ConversionRatioMapperService } from 'src/app/services/mappers/conversion-ratio-mapper.service';
import { UnitFacadeService } from 'src/app/services/util/unit-facade.service';

@Component({
  selector: 'app-conversion-ratios-form',
  templateUrl: './conversion-ratios-form.component.html',
  styleUrls: ['./conversion-ratios-form.component.scss']
})
export class ConversionRatiosFormComponent implements OnInit, OnDestroy, AfterViewChecked {

  @Input() conversionRatios: FormArray;
  @Input() constituentType: ConstituentType;

  @ViewChildren(MatExpansionPanel) expansionPanels: QueryList<MatExpansionPanel>;

  conversionRatioUnitOptions: Opt[];

  private subscriptions: Subscription[] = [];

  constructor(
    private conversionRatioMapperService: ConversionRatioMapperService,
    private conversionRatioService: ConversionRatioService,
    private autoCompleteService: AutoCompleteService,
    private unitPipe: UnitPipe,
    private unitMapperService: UnitMapperService,
    private unitApiService: UnitApiService,
    private unitFacadeService: UnitFacadeService
  ) { }

  ngOnInit(): void {
    this.replaceNullUnitsWithBlankUnits();
    this.scrubUnits();
    this.prepareConversionRatioUnitOptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    // expand panels that need to be expanded
    this.panelsThatNeedToBeOpened().forEach(exp => {
      this.openPanelAsMacroTask(exp);
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
    const cvRat = new ConversionRatio();
    cvRat.unitA = new Unit();
    cvRat.unitB = new Unit();
    const conversionRatioCtrl = this.conversionRatioMapperService.modelToFormGroup(cvRat);
    this.conversionRatios.insert(0, conversionRatioCtrl);
    this.replaceNullUnitsWithBlankUnits();
    this.scrubUnits();

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

  private prepareConversionRatioUnitOptions(): void {
    // Array.flatMap not polyfilled in this version of angular/ts?
    this.conversionRatioUnitOptions = this.autoCompleteService.optionsForConversionRatioUnit('nutrient')
      .reduce((acc, optGroup) => acc.concat(optGroup.groupOptions), []);

    this.subscriptions.push(
      this.unitApiService.getAll().subscribe(units => {
        // filter for just user-managed units
        units = units.filter(unit => this.unitFacadeService.isUserManagedUnit(unit.abbreviation));
        // append to options
        units.forEach(unit => {
          this.conversionRatioUnitOptions.push(this.autoCompleteService.mapUnitToAutoCompleteOption(unit, 'nutrient'));
        })
      })
    );
  }

  private openPanelAsMacroTask(exp: MatExpansionPanel): void {
    // wrap in async macrotask to avoid exception.
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error
    setTimeout(() => {
      exp.open();
    });
  }

  private panelsThatNeedToBeOpened(): MatExpansionPanel[] {
    const results: MatExpansionPanel[] = [];
    if (this.expansionPanels.length) {
      this.expansionPanels.forEach((exp, index) => {
        const cvRat: FormGroup = this.conversionRatios.controls[index] as FormGroup;
        if (!IsMeaningfulValue(cvRat.get('amountA').value)
          && !IsMeaningfulValue(cvRat.get('unitA.abbreviation').value)
          && !IsMeaningfulValue(cvRat.get('amountB').value)
          && !IsMeaningfulValue(cvRat.get('unitB.abbreviation').value)) {
          results.push(exp);
        }
      });
    }
    return results;
  }

  /**
   * Backend api only needs abbreviation to resolve or create unit.
   * Scrub all other information so it's not confusing when we just update abbreviation.
   */
  private scrubUnits(): void {
    this.conversionRatios.controls.forEach(cvRatFG => {
      [cvRatFG.get('unitA'), cvRatFG.get('unitB')].forEach(unitFG => {
        unitFG.get('id')?.reset();
        unitFG.get('plural')?.reset();
        unitFG.get('singular')?.reset();
      });
    });
  }

  /**
   * In some cases we might get conversion ratios that have null for a unit.
   * Particularly in the case where there's a free form value conversion ratio.
   * Iterate through conversion ratios and replace null values with a blank unit form group so
   * we can edit it in the form.
   */
  private replaceNullUnitsWithBlankUnits(): void {
    this.conversionRatios.controls.forEach((cvRatFG: FormGroup) => {
      ['unitA', 'unitB'].forEach((ctrlName: string) => {
        if (cvRatFG.get(ctrlName).value === null) {
          const unit = new Unit();
          unit.isDraft = false;
          const unitFG = this.unitMapperService.modelToFormGroup(unit);

          cvRatFG.removeControl(ctrlName);
          cvRatFG.addControl(ctrlName, unitFG);
        }
      });
    });
  }
}
