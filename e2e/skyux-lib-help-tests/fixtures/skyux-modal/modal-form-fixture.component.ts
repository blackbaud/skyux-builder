import {
  Component
} from '@angular/core';

import {
  SkyModalInstance
} from '@skyux/modals';

@Component({
  selector: 'sky-modal-form',
  template: `
    <sky-modal>
      <sky-modal-header>
        Mock Modal
      </sky-modal-header>
      <sky-modal-content>
      </sky-modal-content>
      <sky-modal-footer>
        <button id="modal-close-button" type="button" class="sky-btn sky-btn-primary" (click)="instance.close()">
        </button>
      </sky-modal-footer>
    </sky-modal>`
})
export class SkyModalDemoFormComponent {
  constructor(
    public instance: SkyModalInstance
  ) { }
}
