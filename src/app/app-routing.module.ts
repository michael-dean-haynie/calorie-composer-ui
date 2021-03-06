import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodDetailsComponent } from './components/food-details/food-details.component';
import { FoodFormComponent } from './components/food-form/food-form.component';
import { FoodManagementComponent } from './components/food-management/food-management.component';
import { HomeComponent } from './components/home/home.component';
import { PlanningComponent } from './components/planning/planning.component';
import { SearchComponent } from './components/search/search.component';
import { UnitsFormComponent } from './components/units-form/units-form.component';
import { NavId } from './constants/types/nav-id';


// const routes: Routes = [];
const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: { pageTitle: 'Home', activeNavId: NavId.HOME }
  },
  { path: 'planning', component: PlanningComponent, data: { pageTitle: 'Planning' } },
  { path: 'search', component: SearchComponent, data: { pageTitle: 'Search', activeNavId: NavId.SEARCH } },
  // Units Form
  {
    path: 'unit-management', component: UnitsFormComponent,
    pathMatch: 'full',
    data: { pageTitle: 'Unit Management', activeNavId: NavId.UNIT_MANAGEMENT }
  },
  // Foods
  { path: 'create-food', component: FoodFormComponent, pathMatch: 'full', data: { pageTitle: 'Create New Food' } },
  { path: 'edit-food/:id', component: FoodFormComponent, data: { pageTitle: 'Edit Food', activeNavId: NavId.EDIT_FOOD } },
  { path: 'import-food/:fdcId', component: FoodFormComponent, data: { pageTitle: 'Import Food' } },
  { path: 'food-details/:id', component: FoodDetailsComponent, pathMatch: 'full', data: { pageTitle: 'Food Details' } },
  {
    path: 'food-management', component: FoodManagementComponent,
    pathMatch: 'full',
    data: { pageTitle: 'Food Management', activeNavId: NavId.FOOD_MANAGEMENT }
  },
  // ComboFood Form
  // { path: 'create-combo-food', component: ComboFoodFormComponent, pathMatch: 'full', data: { pageTitle: 'Create New Combo-Food' } },
  // { path: 'edit-combo-food/:id', component: ComboFoodFormComponent, data: { pageTitle: 'Edit Combo-Food' } },
  // empty url
  { path: '', pathMatch: 'full', redirectTo: 'food-management' }, // temp untill 'home' is implemented
  // anything else
  { path: '**', pathMatch: 'full', redirectTo: 'food-management' } // temp until 'home' is implemented
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
