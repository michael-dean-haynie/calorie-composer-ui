import { Component, OnInit } from '@angular/core';
import { FdcApiService } from './services/api/fdc-api.service';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  pageTitle: string;

  constructor(
    private stateService: StateService,
    private fdcApiService: FdcApiService,
  ) { }

  ngOnInit(): void {
    // this.stateService.pageTitle.subscribe(title => this.pageTitle = title);
    this.stateService.pageTitle.subscribe(title => {
      this.pageTitle = title;
    });
  }

}
