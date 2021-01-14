import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Food } from 'src/app/models/food.model';
import { FoodApiService } from 'src/app/services/api/food-api.service';

@Component({
  selector: 'app-food-management',
  templateUrl: './food-management.component.html',
  styleUrls: ['./food-management.component.scss']
})
export class FoodManagementComponent implements OnInit, OnDestroy {
  loading = true;

  displayedColumns: string[] = ['description', 'brand', 'link'];
  dataSource: Food[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private foodApiService: FoodApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.foodApiService.getAllFoods().subscribe(foods => {
        this.dataSource = foods;
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createFood(): void {
    const food = new Food();
    food.description = 'New Food Name';
    this.subscriptions.push(
      this.foodApiService.post(food).subscribe(savedFood => {
        this.router.navigate(['edit-food', savedFood.id]);
      })
    );
  }

}
