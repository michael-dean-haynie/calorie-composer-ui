import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodFormComponent } from './components/food-form/food-form.component';
import { HomeComponent } from './components/home/home.component';
import { PlanningComponent } from './components/planning/planning.component';
import { SearchComponent } from './components/search/search.component';


// const routes: Routes = [];
const routes: Routes = [
  { path: 'home', component: HomeComponent, data: { pageTitle: 'Home' } },
  { path: 'planning', component: PlanningComponent, data: { pageTitle: 'Planning' } },
  { path: 'search', component: SearchComponent, data: { pageTitle: 'Search' } },
  // forms
  { path: 'food-form', component: FoodFormComponent, pathMatch: 'full', data: { pageTitle: 'Create New Food' } },
  { path: 'food-form/:id', component: FoodFormComponent, data: { pageTitle: 'Edit Food' } },
  // empty url
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  // anything else
  { path: '**', pathMatch: 'full', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
