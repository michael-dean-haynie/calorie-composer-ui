import { DecimalPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConversionRatiosFormComponent } from './components/conversion-ratios-form/conversion-ratios-form.component';
import { ErrorMsgComponent } from './components/error-msg/error-msg.component';
import { FoodDetailsComponent } from './components/food-details/food-details.component';
import { FoodFormComponent } from './components/food-form/food-form.component';
import { FoodManagementComponent } from './components/food-management/food-management.component';
import { HomeComponent } from './components/home/home.component';
import { MacroPieChartComponent } from './components/macro-pie-chart/macro-pie-chart.component';
import { MacroTableComponent } from './components/macro-table/macro-table.component';
import { NutrientsFormComponent } from './components/nutrients-form/nutrients-form.component';
import { PlanningComponent } from './components/planning/planning.component';
import { SearchSelectComponent } from './components/search-select/search-select.component';
import { SearchComponent } from './components/search/search.component';
import { UnitsFormComponent } from './components/units-form/units-form.component';
import { MaskDirective } from './directives/mask.directive';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { MacroAmtPipe } from './pipes/macro-amt.pipe';
import { MacroPctgPipe } from './pipes/macro-pctg.pipe';
import { UnitPipe } from './pipes/unit.pipe';


@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    MacroAmtPipe,
    MacroPctgPipe,
    MacroPieChartComponent,
    MacroTableComponent,
    HomeComponent,
    PlanningComponent,
    FoodFormComponent,
    MaskDirective,
    ErrorMsgComponent,
    UnitPipe,
    ConversionRatiosFormComponent,
    NutrientsFormComponent,
    UnitsFormComponent,
    SearchSelectComponent,
    FoodDetailsComponent,
    FoodManagementComponent,
    EllipsisPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    // Angular Material
    MatInputModule,
    MatToolbarModule,
    MatExpansionModule,
    MatListModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressSpinnerModule,


    // NGX
    NgxMatSelectSearchModule,

    // chart.js / ng2-charts
    ChartsModule
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule,
    UnitPipe,
    DecimalPipe,
    EllipsisPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
