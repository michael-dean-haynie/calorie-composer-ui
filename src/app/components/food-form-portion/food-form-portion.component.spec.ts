import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodFormPortionComponent } from './food-form-portion.component';

describe('FoodFormPortionComponent', () => {
  let component: FoodFormPortionComponent;
  let fixture: ComponentFixture<FoodFormPortionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodFormPortionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodFormPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
