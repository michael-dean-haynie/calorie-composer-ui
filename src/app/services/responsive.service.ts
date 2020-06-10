import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  windowWidth = new BehaviorSubject(window.innerWidth);

  constructor() {
    window.onresize = () => {
      this.windowWidth.next(window.innerWidth);
    };
  }

}
