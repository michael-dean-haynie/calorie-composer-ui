import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Food } from 'src/app/models/food.model';
import { NutrientCalculationService } from 'src/app/services/util/nutrient-calculation.service';

@Component({
  selector: 'app-macro-pie-chart',
  templateUrl: './macro-pie-chart.component.html',
  styleUrls: ['./macro-pie-chart.component.scss']
})
export class MacroPieChartComponent implements OnInit {

  @Input() food: Food;

  public pieChartType: ChartType = 'pie';
  public pieChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1,
    cutoutPercentage: 50,
    tooltips: {
      callbacks: {
        label: (tooltipItems, data) => {
          return `${data.labels[tooltipItems.index]}: ${data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]}%`;
        }
      }
    }
  };
  public pieChartLabels: Label[] = ['Fat', 'Carbohydrate', 'Protein'];
  public pieChartData: number[] = [];
  public pieChartColors = [
    {
      backgroundColor: ['rgb(253, 216, 53)', 'rgb(67, 160, 71)', 'rgb(216, 67, 21)'],
    },
  ];

  constructor(private nutrientCalculationService: NutrientCalculationService) { }

  ngOnInit(): void {
    this.pieChartData = [
      this.nutrientCalculationService.macroPctg(this.food, 'Fat'),
      this.nutrientCalculationService.macroPctg(this.food, 'Carbohydrate'),
      this.nutrientCalculationService.macroPctg(this.food, 'Protein'),
    ].map(pct => Math.floor(pct));
  }

}
