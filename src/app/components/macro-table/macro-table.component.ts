import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-macro-table',
  templateUrl: './macro-table.component.html',
  styleUrls: ['./macro-table.component.scss']
})
export class MacroTableComponent implements OnInit {

  displayedColumns = ['macro', 'pctg', 'weight', 'kcal'];
  dataSource = [
    { name: 'Fat', pctg: 100, weight: 100, kcal: 100 },
    { name: 'Carbohydrate', pctg: 100, weight: 100, kcal: 100 },
    { name: 'Protein', pctg: 100, weight: 100, kcal: 100 },
    { name: 'Energy', pctg: null, weight: null, kcal: 100 }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
