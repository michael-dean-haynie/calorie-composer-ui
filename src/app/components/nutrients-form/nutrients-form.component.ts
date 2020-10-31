import { AfterViewChecked, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { Nutrient } from 'src/app/models/nutrient.model';
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

  constructor(
    private autoCompleteService: AutoCompleteService,
    private nutrientMapperService: NutrientMapperService
  ) { }

  ngOnInit(): void {
    // wire up auto complete options
    this.nutrients.controls.forEach((nutrient: FormGroup) => this.addFilteredAutoCompleteOptions(nutrient));
  }

  ngAfterViewChecked(): void {
    // Expand empty (newly added) nutrient expansionPanels
    this.expansionPanels.forEach((exp, index) => {
      const nutrient: FormGroup = this.nutrients.controls[index] as FormGroup;
      if (!IsMeaningfulValue(nutrient.get('name').value)
        && !IsMeaningfulValue(nutrient.get('scalar').value)
        && !IsMeaningfulValue(nutrient.get('unit').value)) {
        exp.open();
      }
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
      && nutrient.get('scalar').touched) {
      return true;
    }
    return false;
  }

  addNutrient(): void {
    const nutrientCtrl = this.nutrientMapperService.modelToFormGroup(new Nutrient());
    this.addFilteredAutoCompleteOptions(nutrientCtrl);
    this.nutrients.insert(0, nutrientCtrl);
  }

  removeNutrient(index: number): void {
    this.nutrients.removeAt(index);
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private addFilteredAutoCompleteOptions(nutrient: FormGroup): void {
    const optionsForNutrientUnit = this.autoCompleteService.optionsForNutrientUnit();
    const optionsForNutrientName = this.autoCompleteService.optionsForNutrientName();
    nutrient.addControl(
      'unitFilteredAutoCompleteOptions',
      new FormControl(this.autoCompleteService.filteredOptions(optionsForNutrientUnit, nutrient.get('unit') as FormControl)));
    nutrient.addControl(
      'nameFilteredAutoCompleteOptions',
      new FormControl(this.autoCompleteService.filteredOptions(optionsForNutrientName, nutrient.get('name') as FormControl)));
  }

}
