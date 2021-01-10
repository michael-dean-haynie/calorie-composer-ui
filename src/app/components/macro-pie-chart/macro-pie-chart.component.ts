import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Color, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet } from 'ng2-charts';
import { Colors } from 'src/app/constants/types/colors';
import { Food } from 'src/app/models/food.model';
import { NutrientCalculationService } from 'src/app/services/util/nutrient-calculation.service';

@Component({
  selector: 'app-macro-pie-chart',
  templateUrl: './macro-pie-chart.component.html',
  styleUrls: ['./macro-pie-chart.component.scss']
})
export class MacroPieChartComponent implements OnInit {

  @Input() food: Food;
  @Input() canvasWidth = 288;

  loading = true;

  pieChartOptions: ChartOptions = {
    responsive: false,
    tooltips: {
      enabled: false
      // intersect: false,
      // callbacks: {
      //   label: (tooltipItems, data) => {
      //     return `${data.labels[tooltipItems.index]}: ${data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]}%`;
      //   }
      // }
    }
  };
  pieChartLabels: Label[] = [['Fat'], ['Carbohydrate'], 'Protein'];
  pieChartColors: Color[] = [
    {
      backgroundColor: [Colors.Fat, Colors.Carbohydrate, Colors.Protein]
    }
  ]
  pieChartData: SingleDataSet = [];
  pieChartType: ChartType = 'pie';
  pieChartLegend = false;
  pieChartPlugins = [];

  constructor(
    private nutrientCalculationService: NutrientCalculationService
  ) {
    // not sure what these do tbh
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    this.pieChartData = [
      this.nutrientCalculationService.pctgCalsInFoodForMacro(this.food, 'Fat'),
      this.nutrientCalculationService.pctgCalsInFoodForMacro(this.food, 'Carbohydrate'),
      this.nutrientCalculationService.pctgCalsInFoodForMacro(this.food, 'Protein')
    ];
    this.loading = false;
  }

}
