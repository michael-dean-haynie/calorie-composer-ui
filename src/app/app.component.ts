import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawerMode, MatSidenavContainer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { NavData } from './constants/types/nav-data.type';
import { NavId } from './constants/types/nav-id';
import { ResponsiveService } from './services/responsive.service';
import { StateService } from './services/state.service';

type SideNavResponsiveMode = 'wide' | 'narrow';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild(MatSidenavContainer) sideNavContainer: MatSidenavContainer;

  pageTitle: string;
  activeNavId: string;

  navItems: NavData[] = [
    {
      id: NavId.HOME,
      label: 'Home',
      destination: 'home'
    },
    {
      id: NavId.UNIT_MANAGEMENT,
      label: 'Unit Management',
      destination: 'unit-management'
    }
  ];

  // sidenav responsive properties
  sideNavResponsiveMode: SideNavResponsiveMode;
  sideNavMode: MatDrawerMode;
  sideNavOpened: boolean;
  sideNavDisableClose: boolean;

  constructor(
    private stateService: StateService,
    private responsiveService: ResponsiveService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('init');
    this.stateService.pageTitle.subscribe(title => {
      this.pageTitle = title;
    });

    this.stateService.activeNavId.subscribe(id => {
      this.activeNavId = id;
      // close sidenav if navigation triggered by url modification
      this.closeSideNavIfNarrow();
    });

    // manage sidenave responsive properties
    this.responsiveService.windowWidth.subscribe(windowWidth => {
      this.updateSideNaveResponsiveProperties(windowWidth);
    });
  }

  navigateTo(destination: string): void {
    this.closeSideNavIfNarrow();
    this.router.navigate([destination]);
  }

  private closeSideNavIfNarrow(): void {
    if (this.sideNavResponsiveMode === 'narrow') {
      this.sideNavContainer.close();
    }
  }

  private updateSideNaveResponsiveProperties(windowWidth: number) {
    console.log(windowWidth);
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

}
