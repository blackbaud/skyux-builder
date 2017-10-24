import { Component } from '@angular/core';

import { SkyModalInstance } from '@blackbaud/skyux/dist/core';

@Component({
  selector: 'sky-modal-form',
  template: `
    <sky-modal>
    <sky-modal-header>
    </sky-modal-header>
    <sky-modal-content>
    </sky-modal-content>
    <sky-modal-footer>
      <button type="button" class="sky-btn sky-btn-primary" (click)="instance.close()">
        Close
      </button>
    </sky-modal-footer>
    </sky-modal>`
})
export class SkyModalDemoFormComponent {
  constructor(public instance: SkyModalInstance) { }
}
