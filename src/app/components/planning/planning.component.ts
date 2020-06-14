import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit {
  planningForm = this.fb.group({
    date: [new Date()]
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

}
