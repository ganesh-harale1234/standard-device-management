import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlight]'
})
export class Highlight {

  constructor(el:ElementRef, render:Renderer2) { 

    render.setStyle(el.nativeElement, 'color', 'red')

  }

}
