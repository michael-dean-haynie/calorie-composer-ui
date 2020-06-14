import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MacroPieChartComponent } from './components/macro-pie-chart/macro-pie-chart.component';
import { MacroTableComponent } from './components/macro-table/macro-table.component';
import { NarrowSearchResultsComponent } from './components/narrow-search-results/narrow-search-results.component';
import { PlanningComponent } from './components/planning/planning.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchSideBarComponent } from './components/search-side-bar/search-side-bar.component';
import { SearchComponent } from './components/search/search.component';
import { MacroAmtPipe } from './pipes/macro-amt.pipe';
import { MacroPctgPipe } from './pipes/macro-pctg.pipe';


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
    PlanningComponent
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
