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

import {ElementRef, Renderer} from '@angular/core';

/**
 * Configure Resize the parent modal
 */
export function resizeModalToParentFrame(renderer: Renderer,
                                         elRef: ElementRef,
                                         height: string,
                                         p: Window = parent) {
  // "context error" warning shows up during unit tests (but they still pass).
  // this can be avoided by running the logic a tick later
  setTimeout(() => {
    const clrModalEl = p.document.querySelector('clr-modal');
    // resize only if the parent modal is there. this prevents the unit tests from failing
    if (clrModalEl === null) {
      return;
    }
    const pluginIframeEl = <HTMLElement>clrModalEl.querySelector('plugin-iframe');
    const targetIframeEl = <HTMLElement>clrModalEl.querySelector('iframe');
    const modalContentEl = <HTMLElement>clrModalEl.querySelector('.modal-content');
    const modalHeaderEl = <HTMLElement>clrModalEl.querySelector('.modal-header');
    const modalBodyEl = <HTMLElement>clrModalEl.querySelector('.modal-body');
    const modalDialogEl = <HTMLElement>clrModalEl.querySelector('.modal-dialog');

    if (modalHeaderEl !== null) {
      modalHeaderEl.parentNode.removeChild(modalHeaderEl);
    }

    renderer.setElementStyle(modalDialogEl, 'height', height);
    renderer.setElementStyle(modalBodyEl, 'height', height);
    renderer.setElementStyle(modalBodyEl, 'max-height', height);
    renderer.setElementStyle(targetIframeEl, 'width', '100%');
    renderer.setElementStyle(targetIframeEl, 'height', '100%');

    // wrapper element that encapsulates iframe tag
    // available from 6.5u1
    if (pluginIframeEl !== null) {
      renderer.setElementStyle(pluginIframeEl, 'height', '100%');
    }
    renderer.setElementStyle(
      elRef.nativeElement.querySelector('.clr-wizard'),
      'height',
      '100vh'
    );
  });
}
