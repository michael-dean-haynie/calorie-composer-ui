import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Opt } from 'src/app/constants/types/select-options';
import { AutoCompleteService } from 'src/app/services/auto-complete.service';

@Component({
  selector: 'app-search-select',
  templateUrl: './search-select.component.html',
  styleUrls: ['./search-select.component.scss']
})
export class SearchSelectComponent implements OnInit, OnChanges {

  @Input() ctrl: FormControl;
  @Input() options: Opt[];
  @Input() placeholder: string;
  @Input() label: string

  filterCtrl: FormControl = new FormControl();

  filteredOptions: Observable<Opt[]> = new Observable<Opt[]>();

  constructor(
    private autoCompleteService: AutoCompleteService
  ) { }

  ngOnInit(): void {
    this.updateOptions();

  }

  ngOnChanges(): void {
    this.updateOptions();
  }

  private updateOptions(): void {
    const optionGroups = [{ groupLabel: '', groupOptions: this.options }];
    this.filteredOptions = this.autoCompleteService.filteredOptions(optionGroups, this.filterCtrl).pipe(
      map(optGroups => optGroups.length ? optGroups[0].groupOptions : [])
    );
  }

}
