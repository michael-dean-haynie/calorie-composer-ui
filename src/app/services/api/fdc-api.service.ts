import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchResultDTO } from 'src/app/contracts/search-result-dto';
import { SearchResult } from 'src/app/models/search-result.model';
import { environment } from 'src/environments/environment';
import { SearchResultMapperService } from '../mappers/search-result-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FdcApiService {

  private baseUrl = `${environment.apiBaseUrl}/fdc`;

  constructor(
    private http: HttpClient,
    private searchResultMapperService: SearchResultMapperService) { }

  search(query: string): Observable<SearchResult> {

    const params = new HttpParams()
      .append('query', query);

    return this.http.get<SearchResultDTO>(`${this.baseUrl}/search`, { params }).pipe(
      map(searchResultDTO => this.searchResultMapperService.dtoToModel(searchResultDTO)),
    );
  }
}
