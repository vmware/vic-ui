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

import {Component, ElementRef, OnInit, Renderer, ViewChild} from '@angular/core';
import {DELETE_VCH_MODAL_ERROR_MESSAGE, DELETE_VCH_MODAL_HEIGHT, VIC_APPLIANCE_PORT} from '../shared/constants';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Headers, Http, RequestOptions} from '@angular/http';

import {ActivatedRoute} from '@angular/router';
import {CreateVchWizardService} from '../create-vch-wizard/create-vch-wizard.service';
import {ExtendedUserSessionService} from '../services/extended-usersession.service';
import {GlobalsService} from 'app/shared';
import {Modal} from 'clarity-angular';
import {Observable} from 'rxjs/Observable';
import {VicVmViewService} from '../services/vm-view.service';
import {VirtualContainerHost} from '../vch-view/vch.model';

@Component({
  selector: 'vic-delete-vch-modal',
  templateUrl: './delete-vch-modal.component.html',
  styleUrls: ['./delete-vch-modal.component.scss']
})
export class DeleteVchModalComponent implements OnInit {
  public form: FormGroup;
  public vch: VirtualContainerHost;
  public containersCount = 0;
  public stoppedContainersCount = 0;
  public suspendedContainersCount = 0;
  public loading = true;
  private vchId: string;
  @ViewChild('modal') modal: Modal;

  constructor(private formBuilder: FormBuilder,
              private globalsService: GlobalsService,
              private renderer: Renderer,
              private el: ElementRef,
              private router: ActivatedRoute,
              private vmViewService: VicVmViewService,
              private http: Http,
              private createWzService: CreateVchWizardService,
              private extSessionService: ExtendedUserSessionService) {
    this.form = formBuilder.group({
      deleteVolumes: false
    });
  }

  /**
   * Launch the modal
   */
  ngOnInit() {
    this.resizeToParentFrame();

    this.router.params.subscribe(params => {
      this.vchId = params.id;
      this.vmViewService.getVchsData({});
      this.vmViewService.getContainersData({});
    });

    const subscription = this.vmViewService.vchs$.combineLatest(this.vmViewService.containers$)
      .subscribe(([vchs, containers]) => {
          this.vch = vchs.find(vch => {
            return vch.id === this.vchId;
          });

          containers.forEach(container => {
            if (container.parentObjectName === this.vch.name) {
              this.containersCount += 1;

              if (container.powerState === 'POWERED_OFF') {
                this.stoppedContainersCount += 1;
              }

              if (container.powerState === 'SUSPENDED') {
                this.suspendedContainersCount += 1;
              }
            }
          });

          this.loading = false;
          this.modal.open();
          subscription.unsubscribe();
        }, err => {
          console.log(err);
          subscription.unsubscribe();
        }
      )
    ;
  }

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
      this.renderer.setElementStyle(modalBodyEl, 'height', `${DELETE_VCH_MODAL_HEIGHT}px`);
      this.renderer.setElementStyle(modalBodyEl, 'min-height', `${DELETE_VCH_MODAL_HEIGHT}px`);
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
    const vchViewFrame = parent.frames[0];
    webPlatform.closeDialog();
    vchViewFrame.postMessage({
      eventType: 'datagridRefresh'
    }, '*');
  }

  onError(error) {
    const frames = window.parent.frames;
    for (let i = 0; i < frames.length; i++) {
      frames[i].postMessage(JSON.stringify({
        type: DELETE_VCH_MODAL_ERROR_MESSAGE,
        payload: error
      }), location.protocol + '//' + location.host);
    }
    this.onCancel();
  }

  /**
   * Deletes the VCH
   */
  onDelete() {
    this.modal.close();
    this.loading = true;
    Observable.combineLatest(
      this.createWzService.getVicApplianceIp(),
      this.createWzService.acquireCloneTicket()
    ).subscribe(([serviceHost, cloneTicket]) => {
      const vchId = this.vch.id.split(':')[3];
      const servicePort = VIC_APPLIANCE_PORT;
      const targetHost = this.extSessionService.getVcenterServersInfo()[0];
      const targetHostname = targetHost.name;
      const targetThumbprint = targetHost.thumbprint;
      const url =
        `https://${serviceHost}:${servicePort}/container/target/${targetHostname}/vch/${vchId}?thumbprint=${targetThumbprint}`;

      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-VMWARE-TICKET': cloneTicket,
      });

      const options = new RequestOptions({
        headers: headers,
        body: {volume_stores: this.form.get('deleteVolumes').value ? 'all' : 'none'}
      });
      this.http.delete(url, options)
        .map(response => response.json())
        .subscribe(response => {
          console.log(response);
          this.loading = false;
          this.onCancel();
        }, error => {
          this.loading = false;
          this.onError(error);
        });
    }, error => {
      this.loading = false;
      this.onError(error);
    });
  }
}
