import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dynamic',
  template: `<p>Dynamic Component {{ index }}</p>`,
})
export class DynamicComponent {

  @Input() index: number;

}