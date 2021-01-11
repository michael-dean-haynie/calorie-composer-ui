import { Injectable } from '@angular/core';
import { NavigationEnd, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NavigationEventData } from '../constants/types/navigation-event-data.type';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  // send values through this subject to update page title in app.component.ts
  pageTitle = new BehaviorSubject<string>('');
  latestNavigationEventData = new BehaviorSubject<NavigationEventData>(null);

  constructor(private router: Router) {
    // listen for routing events to push updates to subjects`
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const data = this.getRouteData();
        const params = this.getRouteParams();

        // capture pate title
        if (data && data.pageTitle) {
          this.pageTitle.next(data.pageTitle);
        }

        // capture data for navigation event data
        let latest: NavigationEventData = {
          navId: null,
          params: {}
        };

        if (data && data.activeNavId) {
          latest.navId = data.activeNavId;
        }

        if (params) {
          Object.keys(params).forEach(key => {
            latest.params[key] = params[key];
          });
        }

        this.latestNavigationEventData.next(latest);
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

  private getRouteParams(): Params {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route.snapshot.params;
  }
}
