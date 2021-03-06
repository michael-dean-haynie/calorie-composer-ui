import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnitApiService } from './api/unit-api.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  unitDraftCount = new BehaviorSubject<number>(null);
  foodManagementNavs = new BehaviorSubject<any>(null);

  constructor(
    private unitApiService: UnitApiService
  ) { }

  updateUnitDraftCount(): void {
    this.unitApiService.getDraftCount().subscribe(count => {
      this.unitDraftCount.next(count);
    });
  }

  updateFoodManagementNavs(): void {
    this.foodManagementNavs.next(null);
  }
}
