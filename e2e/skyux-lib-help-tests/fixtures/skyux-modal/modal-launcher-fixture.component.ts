import {
  Component
} from '@angular/core';

import {
  SkyModalService
} from '@skyux/modals';

import {
  HelpWidgetService
} from '@blackbaud/skyux-lib-help';

import {
  SkyModalDemoFormComponent
} from './modal-form-fixture.component';

@Component({
  selector: 'help-modal-launcher',
  template: `
    <button type="button" id="regular-modal-launcher" class="sky-btn sky-btn-primary" (click)="openModal('regular')">
      Open Regular Modal
    </button>

    <button type="button" id="full-page-modal-launcher" class="sky-btn sky-btn-primary" (click)="openModal('fullPage')">
      Open Full Modal
    </button>`
})
export class HelpModalDemoComponent {
  constructor(
    private helpService: HelpWidgetService,
    private modal: SkyModalService
  ) { }

  public openModal(modalType: string): void {
    const modalOptions = {
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

    const modalInstance = this.modal.open(
      SkyModalDemoFormComponent,
      modalOptions
    );

    modalInstance.helpOpened.subscribe((helpKey: string) => {
      this.helpService.openToHelpKey(helpKey);
    });
  }
}
