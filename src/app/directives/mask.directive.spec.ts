import { ElementRef } from '@angular/core';
import { MaskDirective } from './mask.directive';

describe('MaskDirective', () => {
  it('should create an instance', () => {
    const elementRef: ElementRef = new ElementRef(null);
    const directive = new MaskDirective(elementRef);
    expect(directive).toBeTruthy();
  });
});
