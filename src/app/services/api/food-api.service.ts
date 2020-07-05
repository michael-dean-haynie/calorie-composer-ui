import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { environment } from 'src/environments/environment';
import { FoodMapperService } from '../mappers/food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodApiService {

  private baseUrl = `${environment.apiBaseUrl}/food`;

  constructor(private http: HttpClient, private foodMapperService: FoodMapperService) { }

  post(food: Food): Observable<Food> {
    const body = this.foodMapperService.modelToDTO(food);
    return this.http.post<FoodDTO>(this.baseUrl, body).pipe(
      map(foodDTO => this.foodMapperService.dtoToModel(foodDTO))
    );
  }

  get(id: string): Observable<Food> {
    return this.http.get<FoodDTO>(`${this.baseUrl}/${id}`).pipe(
      map(foodDTO => this.foodMapperService.dtoToModel(foodDTO))
    );
  }

  put(food: Food): Observable<Food> {
    const body = this.foodMapperService.modelToDTO(food);
    return this.http.put<FoodDTO>(this.baseUrl, body).pipe(
      map(foodDTO => this.foodMapperService.dtoToModel(foodDTO))
    );
  }

  search(query: string): Observable<Food[]> {
    const params = new HttpParams()
      .append('searchQuery', query);

    return this.http.get<FoodDTO[]>(`${this.baseUrl}/search`, { params }).pipe(
      map(results => results.map(result => this.foodMapperService.dtoToModel(result)))
    );
  }
}
