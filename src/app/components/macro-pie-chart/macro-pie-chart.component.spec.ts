import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MacroPieChartComponent } from './macro-pie-chart.component';

describe('MacroPieChartComponent', () => {
  let component: MacroPieChartComponent;
  let fixture: ComponentFixture<MacroPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MacroPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MacroPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
