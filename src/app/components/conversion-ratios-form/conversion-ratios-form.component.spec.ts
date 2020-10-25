import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversionRatiosFormComponent } from './conversion-ratios-form.component';

describe('ConversionRatiosFormComponent', () => {
  let component: ConversionRatiosFormComponent;
  let fixture: ComponentFixture<ConversionRatiosFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversionRatiosFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversionRatiosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
