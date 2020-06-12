import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MacroTableComponent } from './macro-table.component';

describe('MacroTableComponent', () => {
  let component: MacroTableComponent;
  let fixture: ComponentFixture<MacroTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MacroTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MacroTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
