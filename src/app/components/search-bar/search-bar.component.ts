import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  query: string;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchService.latestQuery.subscribe(latestQuery => this.query = latestQuery);
  }

  search(event: Event, query: string): void {
    // Do not actually submit form (don't want page to re-load)
    event.preventDefault();

    // make request with query
    this.searchService.search(query);
  }

  saveQuery(): void {
    this.searchService.latestQuery.next(this.query);
  }

}
