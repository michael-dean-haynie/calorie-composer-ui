import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilteredAutocompleteComponent } from './filtered-autocomplete.component';

describe('FilteredAutocompleteComponent', () => {
  let component: FilteredAutocompleteComponent;
  let fixture: ComponentFixture<FilteredAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilteredAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilteredAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
