import { Component, OnInit } from '@angular/core';
import { SearchResult } from 'src/app/models/search-result.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search-side-bar',
  templateUrl: './search-side-bar.component.html',
  styleUrls: ['./search-side-bar.component.scss']
})
export class SearchSideBarComponent implements OnInit {

  results: SearchResult;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchService.results.subscribe(results => this.results = results);
  }

}
