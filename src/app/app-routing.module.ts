import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';


// const routes: Routes = [];
const routes: Routes = [
  { path: 'search', component: SearchComponent },
  // empty url
  { path: '', pathMatch: 'full', redirectTo: 'search' },
  // anything else
  { path: '**', pathMatch: 'full', redirectTo: 'search' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
