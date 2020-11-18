import { AfterViewChecked, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { Unit } from 'src/app/models/unit.model';
import { UnitApiService } from 'src/app/services/api/unit-api.service';
import { UnitMapperService } from 'src/app/services/api/unit-mapper.service';
import { MenuService } from 'src/app/services/menu.service';
import { UnitFacadeService } from 'src/app/services/util/unit-facade.service';

/**
 * Things I want to be able to do from this form
 * - View existing user-manageable units
 * - Edit existing user-manageable units
 * - Add a new unit
 * - See validation across all units while adding / editing / deleting
 * - Navigate real quick the unit management page from other places like a food or combo food form and then go right back
 * - See in the nav that there are unsaved changes (use badges here?)
 * 
 * pu@
 * + update API to have drafts for units
 *  + pu@ add to unit DTO, karate tests, fix other unit methods accordingly
 * - start on units accordian
 * 
 * 
 * Basic layout
 * - accordion of expandsion pannels
 * - expand to edit
 * - save changes to close
 * - cancel changes (draft) to close
 * - on destroy or navigation leave, nav to indicate "unsaved changes" if needed
 */
@Component({
  selector: 'app-units-form',
  templateUrl: './units-form.component.html',
  styleUrls: ['./units-form.component.scss']
})
export class UnitsFormComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChildren(MatExpansionPanel) expansionPanels: QueryList<MatExpansionPanel>;

  subscriptions: Subscription[] = [];

  units: FormArray;

  loading = false;

  unitsWithDraftsHaveBeenOpenedOnPageLoad = false;

  // flags to ignore changes while current request is out, or to avoid cyclic requests
  ignoreChangesFlags: Map<FormGroup, boolean> = new Map();

  constructor(
    private unitApiService: UnitApiService,
    private unitMapperService: UnitMapperService,
    private unitFacade: UnitFacadeService,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.menuService.updateUnitDraftCount();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterViewChecked(): void {
    // expand panels that need to be expanded
    this.panelsThatNeedToBeOpened().forEach(exp => {
      this.openPanelAsMacroTask(exp);
    });
  }

  canCancel(unit: FormGroup): boolean {
    return !this.unitIsDraft(unit);
  }

  /**
   * Check if expansion panel should actually expand/collapse. Undo if nessesary.
   * @param expanding whether the event is from the panel expanding (as opposed to collapsing)
   * @param unit the unit form group
   * @param expPan the expansion panel
   */
  checkExpansion(expanding: boolean, unit: FormGroup, expPan: MatExpansionPanel): void {
    if (!expanding) {
      if (this.unitIsDraft(unit) || this.unitHasDraft(unit)) {
        this.openPanelAsMacroTask(expPan);
      }
    }

    if (expanding) {
      this.createDraftIfNeeded(unit);
    }
  }

  titleForUnit(unit: FormGroup) {
    const s = unit.get('singular').value;
    const p = unit.get('plural').value;
    const a = unit.get('abbreviation').value;

    // Examples:
    //  s / p (a)
    //  s / (a)
    //  p / (a)
    //  a
    // I'm actually quite proud of how terrible this turned out.
    return `${s || ''}${s && p ? ' / ' : ''}${p || ''}${(s || p) ? ' (' : ''}${a}${(s || p) ? ')' : ''}`;

  }

  /**
   * Creates and persists a new unit draft
   */
  create(): void {
    const unitModel = new Unit();
    unitModel.isDraft = true;
    const unit = this.unitMapperService.modelToFormGroup(unitModel);
    this.units.push(unit);

    this.ignoreChangesFlags.set(unit, true);
    this.subscriptions.push(
      this.unitApiService.create(unitModel).subscribe(createdUnit => {
        // TODO: handle errors?

        // update id so further updates work
        unit.get('id').setValue(createdUnit.id);

        this.ignoreChangesFlags.set(unit, false);

        // Update menu
        this.menuService.updateUnitDraftCount();
      }));

    this.saveDraftOnEveryChange(unit);
  }

  /**
   * Discards the draft of a unit and persists to db immediately
   * @param unit the unit
   */
  discardDraft(unit: FormGroup) {
    this.ignoreChangesFlags.set(unit, true);
    unit.get('draft.isDraftPlaceholder').setValue(true);
    const unitModel = this.unitMapperService.formGroupToModel(unit);
    this.subscriptions.push(
      this.unitApiService.update(unitModel).subscribe((updatedUnit) => {
        this.ignoreChangesFlags.set(unit, false);

        // Update menu
        this.menuService.updateUnitDraftCount();

        // TODO: handle errors?
      }));
  }

  /**
   * Save changes for a unit. Persist to db immediately.
   * @param unit the unit to save changes for
   * @param exp the expansion panel for that unit
   */
  save(unit: FormGroup, exp: MatExpansionPanel) {
    this.ignoreChangesFlags.set(unit, true);

    // if it's an existing unit with draft, insert draft values into draftOf, discard draft, update
    if (this.unitHasDraft(unit)) {
      unit.get('singular').setValue(unit.get('draft.singular').value);
      unit.get('plural').setValue(unit.get('draft.plural').value);
      unit.get('abbreviation').setValue(unit.get('draft.abbreviation').value);

      // set placeholder in place of removed draft
      unit.removeControl('draft');
      unit.addControl('draft', this.unitMapperService.draftPlaceholder());
      exp.close();

      const unitModel = this.unitMapperService.formGroupToModel(unit);
      this.subscriptions.push(
        this.unitApiService.update(unitModel).subscribe(() => {
          this.ignoreChangesFlags.set(unit, false);

          // Update menu
          this.menuService.updateUnitDraftCount();


          // TODO: handle errors?
        }));
    }

    // if it's an existing unit but it is a draft itself, update it to not be a draft
    else if (this.unitIsDraft(unit)) {
      unit.get('isDraft').setValue(false);
      exp.close();

      const unitModel = this.unitMapperService.formGroupToModel(unit);
      this.subscriptions.push(
        this.unitApiService.update(unitModel).subscribe(() => {
          this.ignoreChangesFlags.set(unit, false);

          // Update menu
          this.menuService.updateUnitDraftCount();

          // TODO: handle errors?
        }));

    }


  }

  /**
   * Delete a unit and any draft it may have. Persist to db immediately;
   * @param index the index of the unit's formControl in the this.units form array 
   */
  deleteUnit(index: number) {
    const unit: FormGroup = this.units.get([index]) as FormGroup;
    this.ignoreChangesFlags.set(unit, true);
    this.subscriptions.push(
      this.unitApiService.delete(unit.get('id').value).subscribe(() => {
        // TODO: handle errors?
        this.units.removeAt(index);
        this.ignoreChangesFlags.set(unit, false);

        // Update menu
        this.menuService.updateUnitDraftCount();
      }));

  }

  unitHasDraft(unit: FormGroup): boolean {
    // must have nested draft and that must not be a placeholder
    return !!unit.get('draft').value && !unit.get('draft.isDraftPlaceholder').value;
  }

  unitIsDraft(unit: FormGroup): boolean {
    return unit.get('isDraft').value;
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private loadUnits(): void {
    this.loading = true;
    this.subscriptions.push(this.unitApiService.getAll().subscribe(modelUnits => {
      this.units = this.unitMapperService.modelArrayToFormArray(modelUnits.filter(unit => {
        return this.unitFacade.isUserManagedUnit(unit.abbreviation);
      }));

      // start listening for changes within units to save drafts periodically
      this.units.controls.forEach((unit: FormGroup) => {
        this.saveDraftOnEveryChange(unit);
      });

      this.loading = false;
    }));
  }

  private saveDraftOnEveryChange(unit: FormGroup): void {
    this.subscriptions.push(
      unit.valueChanges.pipe(
        filter(() => !this.ignoreChangesFlags.get(unit)),
        debounceTime(500)
      ).subscribe(() => {

        this.ignoreChangesFlags.set(unit, true);
        const unitModel = this.unitMapperService.formGroupToModel(unit);
        this.subscriptions.push(
          this.unitApiService.update(unitModel).subscribe((updatedUnit) => {
            // TODO: handle errors?

            // update ids in case they were new db records so further updates work
            unit.get('id').setValue(updatedUnit.id);
            if (this.unitHasDraft(unit)) {
              unit.get('draft.id').setValue(updatedUnit.draft.id);
            }

            this.ignoreChangesFlags.set(unit, false);

            // Update menu
            this.menuService.updateUnitDraftCount();
          }));
      })
    );
  }

  private createDraftIfNeeded(unit: FormGroup): void {
    // only create draft for this unit if it isn't a draft itself and if doens't already have one
    if (!this.unitHasDraft(unit) && !this.unitIsDraft(unit)) {
      const newDraft = new Unit();
      newDraft.isDraft = true;
      unit.removeControl('draft');
      unit.addControl('draft', this.unitMapperService.modelToFormGroup(newDraft));

      unit.get('draft.singular').setValue(unit.get('singular').value);
      unit.get('draft.plural').setValue(unit.get('plural').value);
      unit.get('draft.abbreviation').setValue(unit.get('abbreviation').value);
    }
  }

  private openPanelAsMacroTask(exp: MatExpansionPanel): void {
    // wrap in async macrotask to avoid exception.
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error
    setTimeout(() => {
      exp.open();
    });
  }

  private panelsThatNeedToBeOpened(): MatExpansionPanel[] {
    const results: MatExpansionPanel[] = [];
    if (this.expansionPanels.length) {
      this.expansionPanels.forEach((exp, index) => {
        const unit: FormGroup = this.units.controls[index] as FormGroup;
        if ((this.unitIsDraft(unit) || this.unitHasDraft(unit)) && !exp.expanded) {
          results.push(exp);
        }
      });
    }
    return results;
  }

}
