import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UnitDescription, UnitService } from 'src/app/services/util/unit.service';

@Component({
  selector: 'app-food-form-portion',
  templateUrl: './food-form-portion.component.html',
  styleUrls: ['./food-form-portion.component.scss']
})
export class FoodFormPortionComponent implements OnInit {

  @Input() foodForm: FormGroup;
  @Input() portionFormControl: FormGroup;

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

  ngOnInit(): void {
    console.log(this.portionFormControl);
  }

  toggleHouseholdMeasureMode(): void {
    const modeControl = this.portionFormControl.get('householdMeasureMode');
    modeControl.setValue(modeControl.value === 'unit-amount' ? 'free-form' : 'unit-amount');
  }

  private mapUnitToAutoCompleteOptions(unit: UnitDescription): any {
    return {
      label: `${unit.plural} (${unit.abbr})`,
      value: unit.abbr
    };
  }

}
