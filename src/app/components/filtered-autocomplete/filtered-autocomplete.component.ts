import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { BehaviorSubject, Observable } from 'rxjs';
import { OptGroup } from 'src/app/constants/types/select-options';


// TODO: Fix ExpressionChangedAfterItHasBeenCheckedError.
// https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error/
@Component({
  selector: 'app-filtered-autocomplete',
  templateUrl: './filtered-autocomplete.component.html',
  styleUrls: ['./filtered-autocomplete.component.scss']
})
export class FilteredAutocompleteComponent implements OnInit {

  @Input() filterChanges: Observable<string>;
  @Input() autoCompleteOpts: OptGroup[];
  @Input() class: string;

  @ViewChild(MatAutocomplete) matAutocomplete: ElementRef;

  filteredAutoCompleteOpts = new BehaviorSubject<OptGroup[]>([]);

  constructor() { }

  ngOnInit(): void {
    // Set initial options
    this.filteredAutoCompleteOpts.next(this.autoCompleteOpts);

    // filter as user types
    this.filterChanges.subscribe(filterString => {
      this.filteredAutoCompleteOpts.next(this.filterAutoCompleteOptions(this.autoCompleteOpts, filterString));
    });
  }

  private filterAutoCompleteOptions(groups: OptGroup[], filterString: string): OptGroup[] {
    const newGroups = this.autoCompleteOpts
      .map(group => {
        // remove options in group that don't match filter value
        // also - don't dork with original list.
        const shallowGroupClone = { ...group };
        shallowGroupClone.groupOptions = group.groupOptions.filter(opt => opt.label.toLowerCase().includes(filterString.toLowerCase()));
        return shallowGroupClone;
      })
      // remove groups that are empty
      .filter(group => group.groupOptions.length > 0);

    return newGroups;
  }

}
