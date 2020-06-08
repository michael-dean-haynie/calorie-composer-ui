import { Component, OnInit } from '@angular/core';
import { FdcApiService } from 'src/app/services/api/fdc-api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(private fdcApiService: FdcApiService) { }

  ngOnInit(): void {
  }

  search(event: Event, query: string): void {
    // Do not actually submit form (don't want page to re-load)
    event.preventDefault();

    // make request with query
    this.fdcApiService.search(query).subscribe(result => {
      console.log(result);
    });
  }

}
