import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComboFoodDTO } from 'src/app/contracts/combo-food-dto';
import { ComboFood } from 'src/app/models/combo-food.model';
import { environment } from 'src/environments/environment';
import { ComboFoodMapperService } from '../mappers/combo-food-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class ComboFoodApiService {

  private baseUrl = `${environment.apiBaseUrl}/comboFood`;

  constructor(
    private http: HttpClient,
    private comboFoodMapperService: ComboFoodMapperService
  ) { }

  post(comboFood: ComboFood): Observable<ComboFood> {
    const body = this.comboFoodMapperService.modelToDTO(comboFood);
    return this.http.post<ComboFoodDTO>(this.baseUrl, body).pipe(
      map(comboFoodDTO => this.comboFoodMapperService.dtoToModel(comboFoodDTO))
    );
  }

  get(id: string): Observable<ComboFood> {
    return this.http.get<ComboFoodDTO>(`${this.baseUrl}/${id}`).pipe(
      map(comboFoodDTO => this.comboFoodMapperService.dtoToModel(comboFoodDTO))
    );
  }
}
