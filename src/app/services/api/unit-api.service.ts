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

  create(unit: Unit): Observable<UnitDTO> {
    const dto = this.unitMapperService.modelToDTO(unit);
    return this.http.post<UnitDTO>(`${this.baseUrl}`, dto).pipe(
      map(unitDTO => this.unitMapperService.dtoToModel(unitDTO))
    );
  }

  getAll(): Observable<Unit[]> {
    return this.http.get<UnitDTO[]>(`${this.baseUrl}/all`).pipe(
      map(unitDTOs => {
        return unitDTOs.map(dto => this.unitMapperService.dtoToModel(dto));
      })
    );
  }

  update(unit: Unit): Observable<Unit> {
    const dto = this.unitMapperService.modelToDTO(unit);
    return this.http.put<UnitDTO>(`${this.baseUrl}`, dto).pipe(
      map(unitDTO => this.unitMapperService.dtoToModel(unitDTO))
    );
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

}
