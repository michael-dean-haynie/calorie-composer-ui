import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboFoodFormFoodAmountComponent } from './combo-food-form-food-amount.component';

describe('ComboFoodFormFoodAmountComponent', () => {
  let component: ComboFoodFormFoodAmountComponent;
  let fixture: ComponentFixture<ComboFoodFormFoodAmountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboFoodFormFoodAmountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboFoodFormFoodAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
