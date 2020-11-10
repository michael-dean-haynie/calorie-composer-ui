import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnitDTO } from 'src/app/contracts/unit-dto';
import { Unit } from 'src/app/models/unit.model';
import { environment } from 'src/environments/environment';
import { UnitMapperService } from './unit-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class UnitApiService {

  private baseUrl = `${environment.apiBaseUrl}/unit`;

  constructor(
    private http: HttpClient,
    private unitMapperService: UnitMapperService
  ) { }

  getAll(): Observable<Unit[]> {
    return this.http.get<UnitDTO[]>(`${this.baseUrl}/all`).pipe(
      map(unitDTOs => {
        return unitDTOs.map(dto => this.unitMapperService.dtoToModel(dto));
      })
    );
  }

}
