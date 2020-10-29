import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Opt, OptGroup } from 'src/app/constants/types/select-options';
import { UnitDescription } from 'src/app/constants/types/unit-description';
import { UnitService } from 'src/app/services/util/unit.service';
import { FilteredAutocompleteComponent } from '../filtered-autocomplete/filtered-autocomplete.component';

@Component({
  selector: 'app-combo-food-form-portion',
  templateUrl: './combo-food-form-portion.component.html',
  styleUrls: ['./combo-food-form-portion.component.scss']
})
export class ComboFoodFormPortionComponent {

  @Input() comboFoodForm: FormGroup;
  @Input() portionFormControl: FormGroup;
  @Input() otherPortionsIndex: number;

  @ViewChild(FilteredAutocompleteComponent) filteredAutocompleteComponent: FilteredAutocompleteComponent;

  metricMeasureACOptions: OptGroup[] = [
    {
      groupLabel: 'Mass',
      groupOptions: UnitService.MetricMassUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    },
    {
      groupLabel: 'Volume',
      groupOptions: UnitService.MetricVolumeUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    }
  ];

  constructor(
    private unitService: UnitService
  ) { }

  removeNonSSPortion(): void {
    const otherPortions = this.comboFoodForm.get('otherPortions') as FormArray;
    otherPortions.removeAt(this.otherPortionsIndex);
  }

  private mapUnitToAutoCompleteOptions(unit: UnitDescription): Opt {
    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

}
