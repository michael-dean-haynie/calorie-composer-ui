import { AfterViewInit, Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, tap } from 'rxjs/operators';
import { IsMeaningfulValue } from 'src/app/constants/functions';
import { RefUnit } from 'src/app/constants/types/reference-unit.type';
import { FoodDTO } from 'src/app/contracts/food-dto';
import { PageDTO } from 'src/app/contracts/page-dto';
import { Food } from 'src/app/models/food.model';
import { Unit } from 'src/app/models/unit.model';
import { FdcApiService } from 'src/app/services/api/fdc-api.service';
import { FoodApiService } from 'src/app/services/api/food-api.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(MatExpansionPanel) expansionPanels: QueryList<MatExpansionPanel>;

  searchCtrl: FormControl;
  results: PageDTO<FoodDTO>;
  macroTablePerUnit: Unit = this.servingUnit();

  // Flag to ignore updates to results
  private ignoreResultsUpdatesFlag = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private foodApiService: FoodApiService,
    private fdcApiService: FdcApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchCtrl = new FormControl();

    // Handle updates to latestQuery
    this.subscriptions.push(
      this.searchService.latestQuery.pipe(
        distinctUntilChanged()
      ).subscribe(query => {
        this.searchCtrl.setValue(query);
      })
    );

    // Handle updates to results
    this.subscriptions.push(
      this.searchService.results.pipe(
        filter(() => !this.ignoreResultsUpdatesFlag),
      ).subscribe(results => {
        this.results = results;
      })
    );

    // Handle changes coming from the search input
    this.subscriptions.push(
      this.searchCtrl.valueChanges.pipe(
        tap(newQuery => this.searchService.latestQuery.next(newQuery)),
        debounceTime(200),
        distinctUntilChanged()
      ).subscribe(newQuery => {
        this.searchService.search(newQuery);
      })
    );
  }

  ngAfterViewInit(): void {
    // Handle existing selection
    this.subscriptions.push(
      this.searchService.selectedFoodFdcId.pipe(
        take(1)
      ).subscribe(fdcId => {
        if (IsMeaningfulValue(fdcId)) {
          this.openExpPanByFdcId(fdcId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // TODO: actually use converion ratio service
  getHackyPerPortionLabel(food: FoodDTO): string {
    const cvRat = food.conversionRatios.find(cr => {
      return (cr.unitA.abbreviation === RefUnit.SERVING
        || cr.unitB.abbreviation === RefUnit.SERVING)
        && (!IsMeaningfulValue(cr.freeFormValueA) && !IsMeaningfulValue(cr.freeFormValueB));
    });
    if (cvRat) {
      const useSideA = cvRat.unitA.abbreviation !== RefUnit.SERVING;
      if (useSideA) {
        return `per  ${cvRat.amountA} ${cvRat.unitA.abbreviation} portion`;
      } else {
        return `per  ${cvRat.amountB} ${cvRat.unitB.abbreviation} portion`;
      }
    }
    return '';
  }

  lazyLoadFullFood(fdcId: string) {
    this.searchService.selectedFoodFdcId.next(fdcId);

    const food = this.results.content.find(foodResult => foodResult.fdcId === fdcId);
    if (!this.checkFoodFullyLoaded(food)) {
      this.ignoreResultsUpdatesFlag = true; // avoid processing update from service when info is already here
      this.subscriptions.push(
        this.fdcApiService.get(fdcId).subscribe(fullFood => {
          console.log(fullFood);
          this.results.content = this.results.content.map(existingFood => {
            return existingFood.fdcId === fdcId ? this.merge(fullFood, existingFood) : existingFood;
          });
          this.searchService.results.next(this.results);
          this.ignoreResultsUpdatesFlag = false;
        })
      );
    }
  }

  checkFoodFullyLoaded(food: FoodDTO): boolean {
    return !!food.nutrients && !!food.nutrients.length;
  }

  import(food: FoodDTO): void {
    // TODO: actually use mapper
    const foodModel: Food = food as Food;
    this.foodApiService.post(foodModel).subscribe(createdFood => {
      this.router.navigate(['edit-food', createdFood.id]);
    });
  }

  /**
   * ----------------------------------------
   * Private
   * ----------------------------------------
   */

  // Merge fully loaded food into existing partial one
  private merge(src: FoodDTO, target: FoodDTO): FoodDTO {
    target.nutrients = src.nutrients;
    target.conversionRatios = src.conversionRatios;
    return target;
  }

  private openExpPanByFdcId(fdcId: string): void {
    this.expansionPanels.forEach((exp, index) => {
      const assocFood = this.results.content[index];
      if (assocFood.fdcId === fdcId) {
        this.openPanelAsMacroTask(exp);
      }
    });
  }

  private openPanelAsMacroTask(exp: MatExpansionPanel): void {
    // wrap in async macrotask to avoid exception.
    // https://indepth.dev/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error
    setTimeout(() => {
      exp.open();
    });
  }

  private servingUnit(): Unit {
    const unit = new Unit();
    unit.abbreviation = RefUnit.SERVING;
    return unit;
  }


}
