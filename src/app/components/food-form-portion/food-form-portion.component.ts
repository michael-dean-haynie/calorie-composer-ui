import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { OptGroup } from 'src/app/constants/types/select-options';
import { UnitDescription } from 'src/app/constants/types/unit-description';
import { UnitService } from 'src/app/services/util/unit.service';
import { FilteredAutocompleteComponent } from '../filtered-autocomplete/filtered-autocomplete.component';

@Component({
  selector: 'app-food-form-portion',
  templateUrl: './food-form-portion.component.html',
  styleUrls: ['./food-form-portion.component.scss']
})
export class FoodFormPortionComponent {

  @Input() foodForm: FormGroup;
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

  toggleHouseholdMeasureMode(): void {
    const modeControl = this.portionFormControl.get('householdMeasureMode');
    modeControl.setValue(modeControl.value === 'unit-scalar' ? 'free-form' : 'unit-scalar');
  }

  removeNonSSPortion(): void {
    const otherPortions = this.foodForm.get('otherPortions') as FormArray;
    otherPortions.removeAt(this.otherPortionsIndex);
  }

  private mapUnitToAutoCompleteOptions(unit: UnitDescription): any {
    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

}
