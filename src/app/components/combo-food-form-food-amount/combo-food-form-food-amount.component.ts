import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FoodApiService } from 'src/app/services/api/food-api.service';

@Component({
  selector: 'app-combo-food-form-food-amount',
  templateUrl: './combo-food-form-food-amount.component.html',
  styleUrls: ['./combo-food-form-food-amount.component.scss']
})
export class ComboFoodFormFoodAmountComponent implements OnInit {

  @Input() foodAmountCtrl: FormGroup;

  allOptions = ['aqueduct', 'beautiful', 'cowardly'];

  foodACOptions = new BehaviorSubject<string[]>(this.allOptions);

  constructor(
    private foodApiService: FoodApiService
  ) { }

  ngOnInit(): void {
    this.foodAmountCtrl.get('foodName').valueChanges.pipe(
      debounceTime(200)
    ).subscribe(value => {
      this.foodApiService.search(value).subscribe(results => {
        this.foodACOptions.next(results.map(result => `${result.description}`));
      });

      // const newOptions = this.allOptions.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));
      // this.foodACOptions.next(newOptions);
    });
  }

}
