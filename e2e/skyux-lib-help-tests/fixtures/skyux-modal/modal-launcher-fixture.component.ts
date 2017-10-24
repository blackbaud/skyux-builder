import { Component } from '@angular/core';

import { SkyModalService } from '@blackbaud/skyux/dist/core';

import { SkyModalDemoFormComponent } from './modal-form-fixture.component';

@Component({
  selector: 'help-modal-launcher',
  templateUrl: './modal-launcher-fixture.component.html'
})
export class HelpModalDemoComponent {
  constructor(
    private modal: SkyModalService) { }

  public openModal(modalType: string) {

    let modalOptions = {
      fullPage: false,
      helpKey: 'modal-header'
    };

    switch (modalType) {
      case 'fullPage':
        modalOptions.fullPage = true;
        break;
      default:
        break;
    }

    this.modal.open(SkyModalDemoFormComponent, modalOptions);
  }
}
