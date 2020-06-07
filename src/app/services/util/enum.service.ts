import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnumService {

  constructor() { }

  getEnumMembers(theEnum): string[] {
    return Object.keys(theEnum).filter(key => isNaN(parseInt(key, 10)));
  }
}

