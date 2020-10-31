import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NutrientsFormComponent } from './nutrients-form.component';

describe('NutrientsFormComponent', () => {
  let component: NutrientsFormComponent;
  let fixture: ComponentFixture<NutrientsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NutrientsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NutrientsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
