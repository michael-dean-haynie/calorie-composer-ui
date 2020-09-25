import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComboFoodFormComponent } from './components/combo-food-form/combo-food-form.component';
import { FoodFormPortionComponent } from './components/food-form-portion/food-form-portion.component';
import { FoodFormComponent } from './components/food-form/food-form.component';
import { HomeComponent } from './components/home/home.component';
import { MacroPieChartComponent } from './components/macro-pie-chart/macro-pie-chart.component';
import { MacroTableComponent } from './components/macro-table/macro-table.component';
import { NarrowSearchResultsComponent } from './components/narrow-search-results/narrow-search-results.component';
import { PlanningComponent } from './components/planning/planning.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchSideBarComponent } from './components/search-side-bar/search-side-bar.component';
import { SearchComponent } from './components/search/search.component';
import { MaskDirective } from './directives/mask.directive';
import { MacroAmtPipe } from './pipes/macro-amt.pipe';
import { MacroPctgPipe } from './pipes/macro-pctg.pipe';
import { ErrorMsgComponent } from './components/error-msg/error-msg.component';
import { ComboFoodFormPortionComponent } from './components/combo-food-form-portion/combo-food-form-portion.component';
import { ComboFoodFormFoodAmountComponent } from './components/combo-food-form-food-amount/combo-food-form-food-amount.component';
import { FilteredAutocompleteComponent } from './components/filtered-autocomplete/filtered-autocomplete.component';
import { FoodFormConversionRatioComponent } from './components/food-form-conversion-ratio/food-form-conversion-ratio.component';


@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    NarrowSearchResultsComponent,
    SearchComponent,
    SearchSideBarComponent,
    MacroAmtPipe,
    MacroPctgPipe,
    MacroPieChartComponent,
    MacroTableComponent,
    HomeComponent,
    PlanningComponent,
    ComboFoodFormComponent,
    FoodFormComponent,
    MaskDirective,
    FoodFormPortionComponent,
    ErrorMsgComponent,
    ComboFoodFormPortionComponent,
    ComboFoodFormFoodAmountComponent,
    FilteredAutocompleteComponent,
    FoodFormConversionRatioComponent
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
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCardModule,
    MatSlideToggleModule,



    // chart.js / ng2-charts
    ChartsModule
  ],
  providers: [
    MatDatepickerModule,
    MatNativeDateModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
