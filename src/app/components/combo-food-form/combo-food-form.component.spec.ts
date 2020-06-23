import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboFoodFormComponent } from './combo-food-form.component';

describe('ComboFoodFormComponent', () => {
  let component: ComboFoodFormComponent;
  let fixture: ComponentFixture<ComboFoodFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboFoodFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboFoodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
