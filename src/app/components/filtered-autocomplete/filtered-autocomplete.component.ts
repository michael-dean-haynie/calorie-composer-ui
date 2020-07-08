import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { BehaviorSubject, Observable } from 'rxjs';
import { AutoCompleteOptGroup } from 'src/app/constants/types/auto-complete-options.type';

@Component({
  selector: 'app-filtered-autocomplete',
  templateUrl: './filtered-autocomplete.component.html',
  styleUrls: ['./filtered-autocomplete.component.scss']
})
export class FilteredAutocompleteComponent implements OnInit {

  @Input() filterChanges: Observable<string>;
  @Input() autoCompleteOpts: AutoCompleteOptGroup[];

  @ViewChild(MatAutocomplete) matAutocomplete: ElementRef;

  filteredAutoCompleteOpts = new BehaviorSubject<AutoCompleteOptGroup[]>([]);

  constructor() { }

  ngOnInit(): void {
    // Set initial options
    this.filteredAutoCompleteOpts.next(this.autoCompleteOpts);

    // filter as user types
    this.filterChanges.subscribe(filterString => {
      this.filteredAutoCompleteOpts.next(this.filterAutoCompleteOptions(this.autoCompleteOpts, filterString));
    });
  }

  private filterAutoCompleteOptions(groups: AutoCompleteOptGroup[], filterString: string): AutoCompleteOptGroup[] {
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
