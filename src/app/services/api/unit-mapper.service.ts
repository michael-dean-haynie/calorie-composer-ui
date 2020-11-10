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
    unit.singular = unitDTO.singular;
    unit.plural = unitDTO.plural;
    unit.abbreviation = unitDTO.abbreviation;
    return unit;
  }

  modelToDTO(unit: Unit): UnitDTO {
    return unit;
  }

  modelToFormGroup(unit: Unit): FormGroup {
    return this.fb.group({
      id: [unit.id],
      singular: [unit.singular],
      plural: [unit.plural],
      abbreviation: [unit.abbreviation]
    });
  }

  modelArrayToFormArray(units: Unit[]): FormArray {
    return this.fb.array(units.map(unit => this.modelToFormGroup(unit)));
  }

  formGroupToModel(formGroup: FormGroup): Unit {
    const unit = new Unit();
    unit.id = formGroup.get('id').value;
    unit.singular = formGroup.get('singular').value;
    unit.plural = formGroup.get('plural').value;
    unit.abbreviation = formGroup.get('abbreviation').value;
    return unit;
  }

  formArrayToModelArray(formArray: FormArray): Unit[] {
    return formArray.controls.map((formGroup: FormGroup) => this.formGroupToModel(formGroup));
  }
}
