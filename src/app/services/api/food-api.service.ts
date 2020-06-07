import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { Food } from 'src/app/models/food.model';
import { FoodMapperService } from '../mappers/food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class FoodApiService {

  constructor(private http: HttpClient, private foodMapperService: FoodMapperService) { }

  getFood(): Observable<Food> {
    return this.http.get<FoodDTO>('http://localhost:8080').pipe(
      map(foodDTO => this.foodMapperService.dtoToModel(foodDTO)),
    );
  }
}
