import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrls: ['./error-msg.component.scss']
})
export class ErrorMsgComponent {

  private static msgMap: Map<string, string> = new Map<string, string>([
    ['required', 'This field is required.'],
    ['noConvertingApplesToApples', 'Cannot convert one amt of a unit to another amt of the same unit. That\'s nonsense.']
  ]);

  @Input() ctrl: AbstractControl;
  @Input() errors: string[];
  @Input() recursive = false;

  constructor() { }

  get doShowErrors(): boolean {
    return !!this.findErrors();
  }

  get msg(): string {
    // collect errors that are present
    const foundErrors = this.findErrors();

    if (!foundErrors) {
      return null;
    }

    // get list of errors that are present and should be displayed
    const errorsToDisplay = this.errors?.filter(err => foundErrors.includes(err)) ?? foundErrors;

    // return msg for first error
    const errorKeys = Object.keys(errorsToDisplay);
    if (Object.keys(errorsToDisplay).length) {
      return ErrorMsgComponent.msgMap.get(errorKeys[0]) || errorKeys[0];
    } else {
      return '';
    }
  }

  private findErrors(): ValidationErrors | null {
    return this.recursive ? this.getRecursiveErrors(this.ctrl) : this.ctrl.errors;
  }


  private getRecursiveErrors(ctrl: AbstractControl): ValidationErrors | null {
    if (ctrl instanceof FormControl) {
      return ctrl.errors;
    }

    else if (ctrl instanceof FormArray || ctrl instanceof FormGroup) {
      let errors = ctrl.errors;
      Object.keys(ctrl.controls).forEach(nestedCtrlName => {
        const nestedCtrl = ctrl.get(nestedCtrlName);
        const nestedErrors = this.getRecursiveErrors(nestedCtrl);
        if (nestedErrors) {
          errors = errors ? { ...errors, ...nestedErrors } : nestedErrors;
        }
      });
      return errors;
    }

    else {
      return null;
    }
  }

}
