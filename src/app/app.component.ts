import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavData } from './constants/types/nav-data.type';
import { NavId } from './constants/types/nav-id';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

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

  constructor(
    private stateService: StateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.stateService.pageTitle.subscribe(title => {
      this.pageTitle = title;
    });

    this.stateService.activeNavId.subscribe(id => {
      this.activeNavId = id;
    });
  }

  navigateTo(destination: string): void {
    this.router.navigate([destination]);
  }

}
