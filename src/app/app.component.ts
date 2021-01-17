import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawerMode, MatSidenavContainer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavData } from './constants/types/nav-data.type';
import { NavId } from './constants/types/nav-id';
import { NavigationEventData } from './constants/types/navigation-event-data.type';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { FoodApiService } from './services/api/food-api.service';
import { MenuService } from './services/menu.service';
import { ResponsiveService } from './services/responsive.service';
import { StateService } from './services/state.service';

type SideNavResponsiveMode = 'wide' | 'narrow';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  @ViewChild(MatSidenavContainer) sideNavContainer: MatSidenavContainer;

  subscriptions: Subscription[] = [];

  pageTitle: string;
  latestNavigationEventData: NavigationEventData;
  activeNavIndex: number;

  navItems: NavData[] = [
    // temp disabled until implemented
    // {
    //   navId: NavId.HOME,
    //   label: 'Home',
    //   destination: 'home'
    // },
    {
      navId: NavId.SEARCH,
      label: 'Search',
      destination: 'search'
    },
    {
      navId: NavId.FOOD_MANAGEMENT,
      label: 'Food Management',
      destination: 'food-management',
    },
    {
      navId: NavId.UNIT_MANAGEMENT,
      label: 'Unit Management',
      destination: 'unit-management',
    }
  ];

  // sidenav responsive properties
  sideNavResponsiveMode: SideNavResponsiveMode;
  sideNavMode: MatDrawerMode;
  sideNavOpened: boolean;
  sideNavDisableClose: boolean;

  constructor(
    private stateService: StateService,
    private menuService: MenuService,
    private foodApiService: FoodApiService,
    private responsiveService: ResponsiveService,
    private router: Router,
    private ellipsisPipe: EllipsisPipe,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.stateService.pageTitle.subscribe(title => {
        this.pageTitle = title;
      })
    );

    this.subscriptions.push(
      this.stateService.latestNavigationEventData.subscribe(eventData => {
        this.latestNavigationEventData = eventData;
        // close sidenav if navigation triggered by url modification
        this.closeSideNavIfNarrow();
      })
    );

    // manage sidenave responsive properties
    this.subscriptions.push(
      this.responsiveService.windowWidth.subscribe(windowWidth => {
        this.updateSideNaveResponsiveProperties(windowWidth);
      })
    );

    // make initial request and listen for updates to unitDraftCount
    this.menuService.updateUnitDraftCount();
    this.subscriptions.push(
      this.menuService.unitDraftCount.subscribe(count => {
        this.updateUnitDraftCount(count);
      })
    );

    // make initial request and listen for updates for FoodManagementNavs
    // this.updateFoodManagementNavs();
    this.subscriptions.push(
      this.menuService.foodManagementNavs.subscribe(() => {
        this.updateFoodManagementNavs();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  navigateTo(destination: string): void {
    this.closeSideNavIfNarrow();
    this.router.navigate([destination]);
  }

  navMatchesEvent(navData: NavData): boolean {
    const eventData = this.latestNavigationEventData;
    if (!eventData) {
      return false;
    }

    if (navData.navId !== eventData.navId) {
      return false;
    }

    const paramsMatch = navData.params
      ? eventData.params && Object.keys(navData.params).every(key => {
        return '' + navData.params[key] === '' + eventData.params[key];
      })
      : true;

    return paramsMatch;
  }

  /**
   * Always return false. This took forever to fix.
   * I kept getting this ExpressionChangedAfterItHasBeenCheckedError in the console on initial page load while the dynamic
   * nav items are being initialized. Thought for a long time it had to do with my shared service triggering changes from a
   * component lower in the heirarchy to one that was higher. Turns out it was because when the mat-list-option componenti inside
   * a mat-selection-list component does some fancy delays upon initialization that cause the error. But it only happens when it's
   * determined that the option being initialized needs to be flagged as selected. This check happens using the compareWith attribute.
   * So by hard coding that to always return false (since I'm not using the comopnent as a form input) the problem disappears.
   * 
   * https://github.com/angular/components/blob/db7ff985ac5f7d36ae394f5190e69bc7dd06d064/src/material/list/selection-list.ts#L203-L205
   */
  get compareWithFunc(): (o1: any, o2: any) => boolean {
    return (o1: any, o2: any) => false;
  };

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  private closeSideNavIfNarrow(): void {
    if (this.sideNavResponsiveMode === 'narrow') {
      this.sideNavContainer.close();
    }
  }

  private updateSideNaveResponsiveProperties(windowWidth: number) {
    if (windowWidth < 800) {
      this.sideNavResponsiveMode = 'narrow';
      this.sideNavMode = 'over';
      this.sideNavOpened = false;
      this.sideNavDisableClose = false;
    } else {
      this.sideNavResponsiveMode = 'wide';
      this.sideNavMode = 'side';
      this.sideNavOpened = true;
      this.sideNavDisableClose = true;
    }
  }

  private updateUnitDraftCount(count: number): void {
    const navItem = this.navItems.find(item => item.navId === NavId.UNIT_MANAGEMENT);
    if (!navItem) {
      console.warn('Attempting to update unit draft count but there is no unit management nav item to update');
      return;
    }

    // if zero or otherwise falsey just clear value to make badge disappear
    if (!count) {
      navItem.badgeText = null;
    } else {
      navItem.badgeText = count.toString();
    }
  }

  // do not reassign this.navItems. Just mutate.
  private updateFoodManagementNavs(): void {
    const foodMgmtNavIndex = this.navItems.findIndex(item => item.navId === NavId.FOOD_MANAGEMENT);
    if (foodMgmtNavIndex === -1) {
      console.warn('Attempting to update food management navs but there is no food management nav');
      return;
    }

    this.subscriptions.push(
      this.foodApiService.getDrafts().subscribe(foods => {
        // build new draft food navs
        const newNavItems: NavData[] = foods.map(food => {
          return {
            navId: NavId.EDIT_FOOD,
            params: { id: food.id },
            label: '(Draft) ' + this.ellipsisPipe.transform(food.description, 25),
            destination: `edit-food/${food.id}`,
            nestedLevel: 1
          };
        });

        // remove old draft food navs
        let oldNavItems = this.navItems.filter(item => item.navId !== NavId.EDIT_FOOD);

        // insert new draft food navs
        oldNavItems = [
          ...oldNavItems.slice(0, foodMgmtNavIndex + 1),
          ...newNavItems,
          ...oldNavItems.slice(foodMgmtNavIndex + 1)
        ];

        // empty and refill navItems (DO NOT RE-ASSIGN)
        this.navItems.length = 0;
        this.navItems.push(...oldNavItems);

        // update food management nav badge
        const managementNav = this.navItems.find(item => item.navId === NavId.FOOD_MANAGEMENT);
        if (foods.length === 0) {
          managementNav.badgeText = null;
        } else {
          managementNav.badgeText = foods.length.toString();
        }
      })
    );
  }

}
