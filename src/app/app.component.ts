import { Component } from '@angular/core';
import { SexEnum } from './constants/enums/sex.enum';
import { Food } from './models/food.model';
import { FoodApiService } from './services/api/food-api.service';
import { EnumService } from './services/util/enum.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private foodApiService: FoodApiService, private enumService: EnumService) { }
  private result: Food;

  doTheThing(): void {
    this.foodApiService.getFood().subscribe(food => {
      console.log(food);
      this.result = food;
    });
  }

  doAnotherThing(): void {
    // [MacroNutrientEnum.Fat, MacroNutrientEnum.Carbohydrate, MacroNutrientEnum.Protein].forEach(macro => {

    //   console.log(macro);
    //   console.log(`ammount: ${this.result.macroAmt(macro)}`);
    //   console.log(`calories: ${this.result.macroCals(macro)}`);
    //   console.log(`calories %: ${this.result.macroPctg(macro)}`);
    // });

    // console.log(SexEnum);
    // console.log(SexEnum.Male);
    // console.log(SexEnum.Female);
    // console.log(SexEnum[SexEnum.Male]);
    // console.log(SexEnum[SexEnum.Female]);

    // const foo: SexEnum = SexEnum['Malez'];
    // console.log(foo);


    console.log(this.enumService.getEnumMembers(SexEnum));

  }
}
