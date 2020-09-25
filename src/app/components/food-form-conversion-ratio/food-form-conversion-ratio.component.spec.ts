import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodFormConversionRatioComponent } from './food-form-conversion-ratio.component';

describe('FoodFormConversionRatioComponent', () => {
  let component: FoodFormConversionRatioComponent;
  let fixture: ComponentFixture<FoodFormConversionRatioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodFormConversionRatioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodFormConversionRatioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
