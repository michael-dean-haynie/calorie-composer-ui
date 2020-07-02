import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComboFoodFormPortionComponent } from './combo-food-form-portion.component';

describe('ComboFoodFormPortionComponent', () => {
  let component: ComboFoodFormPortionComponent;
  let fixture: ComponentFixture<ComboFoodFormPortionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboFoodFormPortionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboFoodFormPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
