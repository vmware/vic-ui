/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

import {Component, ElementRef, OnDestroy, OnInit, Renderer, ViewChild} from '@angular/core';
import {VchGeneralModel} from '../shared/components/vch-general.component';
import {GlobalsService} from '../shared/globals.service';
import {CONFIGURE_VCH_MODAL_HEIGHT} from '../shared/constants';
import {Modal} from 'clarity-angular';

@Component({
  selector: 'vic-configure-vch-modal',
  styleUrls: ['configure-vch-modal.component.scss'],
  templateUrl: './configure-vch-modal.component.html'
})

export class ConfigureVchModalComponent implements OnInit, OnDestroy {
  model: {
    general: VchGeneralModel
  } = {
    general: {
      name: 'test',
      containerNameConvention: '',
      debug: 0,
      syslogAddress: ''
    }
  };
  loading = true;

  @ViewChild('modal') modal: Modal;

  constructor(private globalsService: GlobalsService,
              private renderer: Renderer,
              private el: ElementRef) { }

  ngOnInit() {
    this.resizeToParentFrame();
    this.loading = false;
    this.modal.open();
  }

  ngOnDestroy() { }

  /**
   * Resize the parent modal
   */
  resizeToParentFrame(p: Window = parent) {
    // "context error" warning shows up during unit tests (but they still pass).
    // this can be avoided by running the logic a tick later
    setTimeout(() => {
      const clrModalEl = p.document.querySelector('clr-modal');
      // resize only if the parent modal is there. this prevents the unit tests from failing
      if (clrModalEl === null) {
        return;
      }
      const targetIframeEl = <HTMLElement>clrModalEl.querySelector('iframe');
      const modalContentEl = <HTMLElement>clrModalEl.querySelector('.modal-content');
      const modalHeaderEl = <HTMLElement>clrModalEl.querySelector('.modal-header');
      const modalBodyEl = <HTMLElement>clrModalEl.querySelector('.modal-body');
      const modalDialogEl = <HTMLElement>clrModalEl.querySelector('.modal-dialog');

      if (modalHeaderEl !== null) {
        modalHeaderEl.parentNode.removeChild(modalHeaderEl);
      }

      this.renderer.setElementStyle(modalContentEl, 'overflow', 'hidden');
      this.renderer.setElementStyle(modalDialogEl, 'height', '75vh');
      this.renderer.setElementStyle(modalBodyEl, 'height', `${CONFIGURE_VCH_MODAL_HEIGHT}px`);
      this.renderer.setElementStyle(modalBodyEl, 'min-height', `${CONFIGURE_VCH_MODAL_HEIGHT}px`);
      this.renderer.setElementStyle(targetIframeEl, 'width', '100%');
      this.renderer.setElementStyle(targetIframeEl, 'height', '100%');
      this.renderer.setElementStyle(
        this.el.nativeElement.querySelector('.clr-wizard'),
        'height',
        '100vh'
      );
    });
  }

  /**
   * Close the H5 Client modal
   */
  onCancel() {
    const webPlatform = this.globalsService.getWebPlatform();
    webPlatform.closeDialog();
  }

  /**
   * TODO: Implement API PATCH request
   */
  onSave() {
    const webPlatform = this.globalsService.getWebPlatform();
    webPlatform.closeDialog();
  }
}
