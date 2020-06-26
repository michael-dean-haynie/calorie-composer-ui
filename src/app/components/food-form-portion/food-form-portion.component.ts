import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';

@Component({
  selector: 'app-food-form-portion',
  templateUrl: './food-form-portion.component.html',
  styleUrls: ['./food-form-portion.component.scss']
})
export class FoodFormPortionComponent {

  @Input() foodForm: FormGroup;
  @Input() portionFormControl: FormGroup;
  @Input() otherPortionsIndex: number;

  metricMeasureACOptions = [
    {
      groupLabel: 'Mass',
      options: UnitService.MetricMeasureMassUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    },
    {
      groupLabel: 'Volume',
      options: UnitService.MetricMeasureVolumeUnits.map(unit => this.mapUnitToAutoCompleteOptions(unit))
    }
  ];

  constructor(
    private unitService: UnitService
  ) { }

  toggleHouseholdMeasureMode(): void {
    const modeControl = this.portionFormControl.get('householdMeasureMode');
    modeControl.setValue(modeControl.value === 'unit-amount' ? 'free-form' : 'unit-amount');
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
