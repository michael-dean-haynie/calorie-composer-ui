import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NarrowSearchResultsComponent } from './narrow-search-results.component';


describe('NarrowSearchResultsComponent', () => {
  let component: NarrowSearchResultsComponent;
  let fixture: ComponentFixture<NarrowSearchResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NarrowSearchResultsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NarrowSearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
