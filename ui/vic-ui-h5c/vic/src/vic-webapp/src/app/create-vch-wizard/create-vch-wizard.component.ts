/*
 Copyright 2017 VMware, Inc. All Rights Reserved.

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

import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { Wizard } from 'clarity-angular';
import { GlobalsService } from 'app/shared';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'vic-create-vch-wizard',
  templateUrl: './create-vch-wizard.component.html',
  styleUrls: ['./create-vch-wizard.component.scss']
})
export class CreateVchWizardComponent implements OnInit {
  @ViewChild('wizardlg') wizard: Wizard;
  public loading = false;
  public errorFlag = false;
  public errorMsgs: string[];
  private _cachedData: any = {};

  // TODO: remove the following
  public testVal = 0;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer,
    private globalsService: GlobalsService
  ) { }

  /**
   * Launch the wizard
   */
  ngOnInit() {
    this.wizard.open();
  }

  /**
   * Resize the parent modal where the inline wizard is instantiated such that
   * the wizard fits exactly in the modal. This method is called once the
   * clrWizardOpenChange event is fired. While inlined wizard is a pattern
   * not recommended by the Clarity team, this is the only way to interface
   * with the H5 Client properly through WEB_PLATFORM.openModalDialog()
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
        modalHeaderEl.remove();
      }

      this.renderer.setElementStyle(modalDialogEl, 'height', '75vh');
      this.renderer.setElementStyle(modalBodyEl, 'max-height', '75vh');
      this.renderer.setElementStyle(targetIframeEl, 'height', '75vh');
      this.renderer.setElementStyle(
        this.elRef.nativeElement.querySelector('clr-wizard'),
        'height',
        '100vh'
      );
    });
  }

  /**
   * Perform validation for the current WizardPage and proceed to the next page
   * if the user input is valid. If not, display all validation error messages
   * @param asyncValidationObs : Observable containing async validation results
   */
  onCommit(asyncValidationObs: Observable<any>) {
    this.loading = true;
    asyncValidationObs.subscribe(data => {
      this.errorFlag = false;
      Object.assign(this._cachedData, data);
      this.wizard.forceNext();
    }, errors => {
      this.loading = false;
      this.errorFlag = true;
      this.errorMsgs = errors;
    });
  }

  /**
   * Go back to the previous step
   */
  goBack() {
    this.wizard.previous();
  }

  get cachedData(): any {
    return this._cachedData;
  }

  /**
   * Clear the error flag (this method might be removed)
   * @param fn : page-specific init function
   */
  onPageLoad(afterPageInit?: any) {
    this.errorFlag = false;
    this.errorMsgs = [];
    this.loading = false;
  }

  /**
   * Perform the final data validation and send the data to the
   * OVA endpoint via a POST request
   */
  onFinish(payloadObs: Observable<any> | null) {
    // TODO: send the results to the OVA endpoint via a POST request
    if (!this.loading && payloadObs) {
      payloadObs.subscribe(data => {
        this.errorFlag = false;
        console.log('TODO: send this payload to api endpoint', JSON.stringify(data));
        // TODO: uncomment these
        // this.wizard.forceFinish();
        // this.onCancel();
      }, errors => {
        this.loading = false;
        this.errorFlag = true;
        this.errorMsgs = errors;
      });
      return;
    }

    this.errorFlag = true;
    this.errorMsgs = ['User inputs validation failed!'];
  }

  /**
   * Close the H5 Client modal
   */
  onCancel() {
    const webPlatform = this.globalsService.getWebPlatform();
    webPlatform.closeDialog();
  }
}
