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

import { Component, ElementRef, OnInit, Renderer, ViewChild } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import { CreateVchWizardService } from './create-vch-wizard.service';
import { GlobalsService } from 'app/shared';
import { Observable } from 'rxjs/Observable';
import { RefreshService } from 'app/shared';
import { VIC_APPLIANCE_PORT } from '../shared/constants';
import { Wizard } from '@clr/angular';
import { getServerServiceGuidFromObj } from '../shared/utils/object-reference';
import {VchComputeComponent} from '../shared/components/vch-compute/vch-compute.component';
import {vchViewToVch} from '../shared/utils/vch/vch-utils';
import {resizeModalToParentFrame} from '../shared/utils/modal-resize';
import {Vch} from '../interfaces/vch';

@Component({
  selector: 'vic-create-vch-wizard',
  templateUrl: './create-vch-wizard.component.html',
  styleUrls: ['./create-vch-wizard.component.scss']
})
export class CreateVchWizardComponent implements OnInit {
  @ViewChild('wizardlg') wizard: Wizard;
  @ViewChild('computeCapacityStep') computeCapacity: VchComputeComponent;
  public loading = false;
  public errorFlag = false;
  public errorMsgs: string[];
  private _cachedData: any = {};

  // TODO: remove the following
  public testVal = 0;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer,
    private globalsService: GlobalsService,
    private refresher: RefreshService,
    private http: Http,
    private createWzService: CreateVchWizardService
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
    return resizeModalToParentFrame(this.renderer, this.elRef, '75vh', p);
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
    if (!this.loading && payloadObs) {

        // Acquire a clone ticket from vsphere for auth
        this.createWzService.acquireCloneTicket(getServerServiceGuidFromObj(this.computeCapacity.dcObj))
        .combineLatest(
          // Subscribe to payload observable
          payloadObs,
          this.createWzService.getVicApplianceIp()
        ).subscribe(([cloneTicket, payload, applianceIp]) => {

        if (payload) {
          this.errorFlag = false;
          this.loading = true;

          if (applianceIp && cloneTicket) {
              const lastIndexOfSlash = payload.security.target.lastIndexOf('/');
              const vc = payload.security.target.substr(0, lastIndexOfSlash);
              const url = 'https://' + applianceIp + ':' + VIC_APPLIANCE_PORT +
              '/container/target/' + vc +
              (this.computeCapacity.dcId ? '/datacenter/' + this.computeCapacity.dcId : '') +
              '/vch?' + 'thumbprint=' + payload.security.thumbprint;

              const vch: Vch = vchViewToVch(payload);

              const options  = new RequestOptions({ headers: new Headers({
                  'Content-Type': 'application/json',
                  'X-VMWARE-TICKET': cloneTicket
              })});

              this.http.post(url, JSON.stringify(vch), options)
                  .map(response => response.json())
                  .subscribe(response => {
                    this.loading = false;
                    this.wizard.forceFinish();
                    this.onCancel();
                  }, error => {
                    console.error('error response:', error);
                    this.loading = false;
                    try {
                      error = error._body ? JSON.parse(error._body) : error;
                    } catch (e) {
                      console.error('error parsing:', e);
                    }
                    this.errorFlag = true;
                    this.errorMsgs = [error.message || 'Error creating VCH'];
              });
          } else {
            this.errorFlag = true;
            this.errorMsgs = ['Error connecting to create VCH API'];
          }
        }
      }, errors => {
        console.error('error:', errors);
        this.errorFlag = true;
        this.errorMsgs = errors;
      });
      return;
    }
  }

  /**
   * Close the H5 Client modal
   */
  onCancel() {
    const webPlatform = this.globalsService.getWebPlatform();
    const vchViewFrame = parent.frames[0];
    webPlatform.closeDialog();
    vchViewFrame.postMessage({
      eventType: 'datagridRefresh'
    }, '*');
  }

  get cachedData(): any {
    return this._cachedData;
  }

}
