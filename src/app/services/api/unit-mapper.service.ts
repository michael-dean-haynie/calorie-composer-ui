import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { UnitDTO } from 'src/app/contracts/unit-dto';
import { Unit } from 'src/app/models/unit.model';

@Injectable({
  providedIn: 'root'
})
export class UnitMapperService {

  constructor(
    private fb: FormBuilder
  ) { }

  dtoToModel(unitDTO: UnitDTO): Unit {
    if (!unitDTO) {
      return null;
    }

    const unit = new Unit();
    unit.id = unitDTO.id;
    unit.isDraft = unitDTO.isDraft;
    unit.singular = unitDTO.singular;
    unit.plural = unitDTO.plural;
    unit.abbreviation = unitDTO.abbreviation;
    unit.draft = unitDTO.draft ? this.dtoToModel(unitDTO.draft) : null;
    return unit;
  }

  modelToDTO(unit: Unit): UnitDTO {
    return unit;
  }

  modelToFormGroup(unit: Unit): FormGroup {
    if (!unit) {
      return null;
    }

    return this.fb.group({
      id: [unit.id],
      isDraft: [unit.isDraft],
      singular: [unit.singular],
      plural: [unit.plural],
      abbreviation: [unit.abbreviation],
      draft: this.formGroupDraftOrPlaceholderOrNull(unit),
      isDraftPlaceholder: [false]
    });
  }

  modelArrayToFormArray(units: Unit[]): FormArray {
    return this.fb.array(units.map(unit => this.modelToFormGroup(unit)));
  }

  formGroupToModel(formGroup: FormGroup): Unit {
    if (!formGroup || !formGroup.value) {
      return null;
    }

    const unit = new Unit();
    unit.id = formGroup.get('id').value;
    unit.isDraft = formGroup.get('isDraft').value;
    unit.singular = formGroup.get('singular').value;
    unit.plural = formGroup.get('plural').value;
    unit.abbreviation = formGroup.get('abbreviation').value;
    unit.draft = this.modelDraftOrNull(formGroup);
    return unit;
  }

  formArrayToModelArray(formArray: FormArray): Unit[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }

  /**
   * Creates a formgroup that will serve as a placeholder.
   * When adding a draft, we'll overwrite the values of this formgroup
   * When discarding draft we'll set this placeholder flag back to true
   */
  public draftPlaceholder(): FormGroup {
    const unit = new Unit();
    unit.isDraft = true;
    const formGroup = this.modelToFormGroup(unit);
    formGroup.get('isDraftPlaceholder').setValue(true);
    return formGroup;
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private formGroupDraftOrPlaceholderOrNull(unit: Unit): FormGroup {
    // if model has a draft, create form group of that draft
    if (unit.draft) {
      return this.modelToFormGroup(unit.draft);
    }
    // else if the unit is not a draft itself, create a placeholder for a draft formgroup
    else if (!unit.isDraft) {
      return this.draftPlaceholder();
    }
    // else if the unit is a draft itself, cannot create draft of draft so just set it to null
    else {
      return null;
    }
  }

  private modelDraftOrNull(unit: FormGroup): Unit {
    if (unit.get('draft').value) {
      if (unit.get('draft.isDraftPlaceholder').value) {
        return null;
      } else {
        return this.formGroupToModel(unit.get('draft') as FormGroup);
      }
    } else {
      return null;
    }
  }
}
