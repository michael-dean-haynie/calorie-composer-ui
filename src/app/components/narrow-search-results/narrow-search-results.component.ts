import { Component, OnInit } from '@angular/core';
import { SearchResult } from 'src/app/models/search-result.model';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-narrow-search-results',
  templateUrl: './narrow-search-results.component.html',
  styleUrls: ['./narrow-search-results.component.scss']
})
export class NarrowSearchResultsComponent implements OnInit {

  results: SearchResult;

  constructor(private searchService: SearchService) { }

  ngOnInit(): void {
    this.searchService.results.subscribe(results => this.results = results);
  }

}