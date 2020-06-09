import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  constructor() {
    window.onresize = () => {
      console.log(window.innerWidth);
    };
  }

}
