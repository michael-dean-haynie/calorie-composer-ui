import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UnitApiService } from 'src/app/services/api/unit-api.service';
import { UnitMapperService } from 'src/app/services/api/unit-mapper.service';

@Component({
  selector: 'app-units-form',
  templateUrl: './units-form.component.html',
  styleUrls: ['./units-form.component.scss']
})
export class UnitsFormComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  units: FormArray;
  loading = false;

  constructor(
    private unitApiService: UnitApiService,
    private unitMapperService: UnitMapperService
  ) { }

  ngOnInit(): void {
    this.loadUnits();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUnits(): void {
    this.loading = true;
    this.subscriptions.push(this.unitApiService.getAll().subscribe(modelUnits => {
      this.units = this.unitMapperService.modelArrayToFormArray(modelUnits);
      this.loading = false;
      console.log(this.units);
    }));

  }

}
