import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  transform(value: string, maxLength: number): unknown {
    if (value.length <= maxLength) {
      return value;
    } else {
      return value.substring(0, maxLength - 3) + '...';
    }
  }
}