import { Component, Input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ContradictionSet } from 'src/app/constants/types/contradiction-set.type';
import { PathLink } from 'src/app/constants/types/path-link.type';
import { NewConversionRatioService } from 'src/app/services/new-conversion-ratio.service';

@Component({
  selector: 'app-error-msg',
  templateUrl: './error-msg.component.html',
  styleUrls: ['./error-msg.component.scss']
})
export class ErrorMsgComponent {

  private static msgMap: Map<string, string> = new Map<string, string>([
    ['required', 'This field is required.']
  ]);

  @Input() ctrl: AbstractControl;
  @Input() errors: string[];
  @Input() recursive = false;

  constructor(
    private newConversionRatioService: NewConversionRatioService
  ) { }

  get doShowErrors(): boolean {
    return !!this.findErrors();
  }

  get error(): any {
    // collect errors that are present
    const foundErrors = this.findErrors();

    if (!foundErrors) {
      return null;
    }

    // get list of errors that are present and should be displayed
    const errorsToDisplay = this.errors?.filter(err => foundErrors.includes(err)) ?? foundErrors;

    // return msg or obj for first error
    const errorKeys = Object.keys(errorsToDisplay);
    if (Object.keys(errorsToDisplay).length) {

      // error is custom object
      if (this.isContradictionError(errorsToDisplay[errorKeys[0]])) {
        return errorsToDisplay[errorKeys[0]];
      }

      // error has its own string
      if (typeof errorsToDisplay[errorKeys[0]] === 'string') {
        return errorsToDisplay[errorKeys[0]];
      }

      return ErrorMsgComponent.msgMap.get(errorKeys[0]) || errorKeys[0];
    } else {
      return '';
    }
  }

  isContradictionError(obj: any): boolean {
    return obj
      && Array.isArray(obj) // obj is ContradictionSet[]
      && Array.isArray(obj[0]) // obj[0] is ContradictionSet (also Path[])
      && Array.isArray(obj[0][0]) // obj[0][0] is Path (also PathLink[])
      && obj[0][0][0] instanceof PathLink;
  }

  prepareContradictingPathsForDisplay(contradictionSet: ContradictionSet[]): string[] {
    // just use contradictions in first set
    const paths = contradictionSet[0];
    return paths.map(path => this.newConversionRatioService.condencedPath(path));
  }

  private findErrors(): ValidationErrors | null {
    return this.recursive ? this.findErrorsRecursive(this.ctrl) : this.ctrl.errors;
  }


  private findErrorsRecursive(ctrl: AbstractControl): ValidationErrors | null {
    if (ctrl instanceof FormControl) {
      return ctrl.errors;
    }

    else if (ctrl instanceof FormArray || ctrl instanceof FormGroup) {
      let errors = ctrl.errors;
      Object.keys(ctrl.controls).forEach(nestedCtrlName => {
        const nestedCtrl = ctrl.get(nestedCtrlName);
        const nestedErrors = this.findErrorsRecursive(nestedCtrl);
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
