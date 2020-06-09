import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
  }

  search(event: Event, query: string): void {
    // Do not actually submit form (don't want page to re-load)
    event.preventDefault();

    // make request with query
    this.searchService.search(query);
  }

}
