import { AfterViewChecked, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { Opt } from 'src/app/constants/types/select-options';
import { Nutrient } from 'src/app/models/nutrient.model';
import { Unit } from 'src/app/models/unit.model';
import { AutoCompleteService } from 'src/app/services/auto-complete.service';
import { NutrientMapperService } from 'src/app/services/mappers/nutrient-mapper.service';

@Component({
  selector: 'app-nutrients-form',
  templateUrl: './nutrients-form.component.html',
  styleUrls: ['./nutrients-form.component.scss']
})
export class NutrientsFormComponent implements OnInit, AfterViewChecked {

  @Input() nutrients: FormArray;

  @ViewChildren(MatExpansionPanel) expansionPanels: QueryList<MatExpansionPanel>;

  nutrientUnitOptions: Opt[];

  constructor(
    private autoCompleteService: AutoCompleteService,
    private nutrientMapperService: NutrientMapperService
  ) { }

  ngOnInit(): void {
    // Array.flatMap not polyfilled in this version of angular/ts?
    this.nutrientUnitOptions = this.autoCompleteService.optionsForNutrientUnit()
      .reduce((acc, optGroup) => acc.concat(optGroup.groupOptions), []);
    // wire up auto complete options
    this.nutrients.controls.forEach((nutrient: FormGroup) => this.addFilteredAutoCompleteOptions(nutrient));
    this.scrubNutrientUnits();
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
   * @param nutrient the nutrient form group
   * @param expPan the expansion panel
   */
  checkExpansion(expanding: boolean, nutrient: FormGroup, expPan: MatExpansionPanel): void {
    if (!expanding && !nutrient.valid) {
      expPan.open();
    }
  }

  /**
   * Checks if a nutrient has been touched at the form group level
   * @param nutrient the nutrient form group
   */
  nutrientTouched(nutrient: FormGroup): boolean {
    if (nutrient.get('name').touched && nutrient.get('unit').touched
      && nutrient.get('amount').touched) {
      return true;
    }
    return false;
  }

  addNutrient(): void {
    const nutrient = new Nutrient();
    nutrient.unit = new Unit();
    const nutrientCtrl = this.nutrientMapperService.modelToFormGroup(nutrient);

    this.addFilteredAutoCompleteOptions(nutrientCtrl);
    this.nutrients.insert(0, nutrientCtrl);
    this.scrubNutrientUnits();
  }

  removeNutrient(index: number): void {
    this.nutrients.removeAt(index);
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private openPanelAsMacroTask(exp: MatExpansionPanel): void {
    // wrap in async macrotask to avoid exception.
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error
    setTimeout(() => {
      exp.open();
    });
  }

  private panelsThatNeedToBeOpened(): MatExpansionPanel[] {
    // Expand empty (newly added) nutrient expansionPanels
    const results: MatExpansionPanel[] = [];
    if (this.expansionPanels.length) {
      this.expansionPanels.forEach((exp, index) => {
        const nutrient: FormGroup = this.nutrients.controls[index] as FormGroup;
        if (!IsMeaningfulValue(nutrient.get('name').value)
          && !IsMeaningfulValue(nutrient.get('amount').value)
          && !IsMeaningfulValue(nutrient.get('unit.abbreviation').value)) {
          results.push(exp);
        }
      });
    }
    return results;
  }

  private addFilteredAutoCompleteOptions(nutrient: FormGroup): void {
    const optionsForNutrientName = this.autoCompleteService.optionsForNutrientName();
    nutrient.addControl(
      'nameFilteredAutoCompleteOptions',
      new FormControl(this.autoCompleteService.filteredOptions(optionsForNutrientName, nutrient.get('name') as FormControl)));
  }

  /**
   * Backend api only needs abbreviation to resolve or create unit.
   * Scrub all other information so it's not confusing when we just update abbreviation.
   */
  private scrubNutrientUnits(): void {
    this.nutrients.controls.forEach(nutrientFG => {
      const unitFG = nutrientFG.get('unit') as FormGroup;
      unitFG.get('id').reset();
      unitFG.get('plural').reset();
      unitFG.get('singular').reset();
    });
  }

}
