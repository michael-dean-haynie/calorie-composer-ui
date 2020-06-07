import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Food } from 'src/app/models/food.model';
import { environment } from 'src/environments/environment';
import { FoodMapperService } from '../mappers/food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FdcApiService {

  private baseUrl = `${environment.apiBaseUrl}/fdc`;

  constructor(private http: HttpClient, private foodMapperService: FoodMapperService) { }

  search(query: string): Observable<Food> {

    const params = new HttpParams()
      .append('query', query);

    return this.http.get<any>(`${this.baseUrl}/search`, { params }).pipe(
      tap(value => console.log(value))
      // map(foodDTO => this.foodMapperService.dtoToModel(foodDTO)),
    );
  }
}
