import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FoodDTO } from 'src/app/contracts/FoodDTO';
import { Food } from 'src/app/models/Food';

@Injectable({
  providedIn: 'root'
})
export class FoodApiService {

  constructor(private http: HttpClient) { }

  getFood(): Observable<Food> {
    return this.http.get<FoodDTO>('http://localhost:8080').pipe(
      map(foodDTO => new Food(foodDTO)),
    );
  }
}
