import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';


// const routes: Routes = [];
const routes: Routes = [
  { path: 'home', component: HomeComponent, data: { pageTitle: 'Home' } },
  { path: 'search', component: SearchComponent, data: { pageTitle: 'Search' } },
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
