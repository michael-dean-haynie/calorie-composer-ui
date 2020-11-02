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
  // Food Form
  { path: 'create-food', component: FoodFormComponent, pathMatch: 'full', data: { pageTitle: 'Create New Food' } },
  { path: 'edit-food/:id', component: FoodFormComponent, data: { pageTitle: 'Edit Food' } },
  { path: 'import-food/:fdcId', component: FoodFormComponent, data: { pageTitle: 'Import Food' } },
  // ComboFood Form
  // { path: 'create-combo-food', component: ComboFoodFormComponent, pathMatch: 'full', data: { pageTitle: 'Create New Combo-Food' } },
  // { path: 'edit-combo-food/:id', component: ComboFoodFormComponent, data: { pageTitle: 'Edit Combo-Food' } },
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
