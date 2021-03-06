import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { PageDTO } from 'src/app/contracts/page-dto';
import { Food } from 'src/app/models/food.model';
import { environment } from 'src/environments/environment';
import { FoodMapperService } from '../mappers/food-mapper.service';
import { SearchResultMapperService } from '../mappers/search-result-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FdcApiService {

  private baseUrl = `${environment.apiBaseUrl}/fdc`;

  constructor(
    private http: HttpClient,
    private searchResultMapperService: SearchResultMapperService,
    private foodMapperService: FoodMapperService
  ) { }

  search(query: string): Observable<PageDTO<FoodDTO>> {

    const params = new HttpParams()
      .append('query', query);

    return this.http.get<PageDTO<FoodDTO>>(`${this.baseUrl}/search`, { params });
  }

  get(fdcId: string): Observable<Food> {
    return this.http.get<FoodDTO>(`${this.baseUrl}/food/${fdcId}`).pipe(
      map(foodDTO => this.foodMapperService.dtoToModel(foodDTO))
    );
  }
}
