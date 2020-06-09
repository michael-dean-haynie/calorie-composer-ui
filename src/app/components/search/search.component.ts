import { Component, OnInit } from '@angular/core';
import { ResponsiveService } from 'src/app/services/responsive.service';

// specific for this component
type LayoutMode = 'narrow' | 'wide';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  layoutMode: LayoutMode = 'narrow';

  constructor(private responsiveService: ResponsiveService) { }

  ngOnInit(): void {
    this.responsiveService.windowWidth.subscribe(windowWidth => {
      this.setLayoutMode(windowWidth);
    });
  }

  private setLayoutMode(windowWidth: number) {
    this.layoutMode = windowWidth < 500 ? 'narrow' : 'wide';
  }

}
