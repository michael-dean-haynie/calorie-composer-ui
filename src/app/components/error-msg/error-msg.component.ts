import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrls: ['./error-msg.component.scss']
})
export class ErrorMsgComponent implements OnInit {

  private static msgMap: Map<string, string> = new Map<string, string>([
    ['required', 'This field is required.'],
    ['nutrientRefPortionRequired', 'At least one portion must be marked as a nutrient reference portion.'],
    ['oneNutrientRefPortionPerUnitType', 'No more than one nutrient reference portion per unit type (mass / volume).']
  ]);

  @Input() ctrl: AbstractControl;
  @Input() errors: string[];

  constructor() { }

  ngOnInit(): void {
  }

  get msg(): string {
    // collect errors that are present
    const presentErrors = Object.keys(this.ctrl.errors);

    // get list of errors that are present and should be displayed
    const errorsToDisplay = this.errors?.filter(err => presentErrors.includes(err)) ?? presentErrors;

    // return msg for first error in that list
    return ErrorMsgComponent.msgMap.get(errorsToDisplay[0]);
  }

}
