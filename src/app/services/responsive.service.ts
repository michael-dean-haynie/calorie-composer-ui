import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  windowWidth = new BehaviorSubject(window.innerWidth);

  constructor() {
    window.onresize = () => {
      console.log(window.innerWidth);
      this.windowWidth.next(window.innerWidth);
    };
  }

}
