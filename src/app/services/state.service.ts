import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  // send values through this subject to update page title in app.component.ts
  pageTitle = new BehaviorSubject<string>('');

  constructor(private router: Router) {
    // listen for routing events to push updates to header text subjects`
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const data = this.getRouteData();
        if (data && data.pageTitle) {
          this.pageTitle.next(data.pageTitle);
        }
      }
    });
  }

  private getRouteData(): any {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.data;
  }
}
