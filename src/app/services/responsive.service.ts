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
      this.setWindowInnerHeight();
    };

    window.onload = () => {
      this.setWindowInnerHeight();
    };
  }

  private setWindowInnerHeight(): void {
    // set a css variable for window inner height. 100vh doesn't work when mobile address bar is there.
    document.documentElement.style.setProperty('--wih', `${window.innerHeight}px`);
  }

}
