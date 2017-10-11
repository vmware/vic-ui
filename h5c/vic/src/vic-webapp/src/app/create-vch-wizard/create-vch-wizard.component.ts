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
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { RefreshService } from 'app/shared';

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
    private globalsService: GlobalsService,
    private refressher: RefreshService,
    private http: Http
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
        modalHeaderEl.parentNode.removeChild(modalHeaderEl);
      }

      this.renderer.setElementStyle(modalDialogEl, 'height', '75vh');
      this.renderer.setElementStyle(modalBodyEl, 'height', '75vh');
      this.renderer.setElementStyle(modalBodyEl, 'max-height', '75vh');
      this.renderer.setElementStyle(targetIframeEl, 'width', '100%');
      this.renderer.setElementStyle(targetIframeEl, 'height', '100%');
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
  onFinish(payloadObs: Observable<any> | null): Observable<Response> {
    if (!this.loading && payloadObs) {
      payloadObs.subscribe(payload => {

        console.log('wizard payload: ', payload);

        this.errorFlag = false;

        // TODO: replace api endpoint IP with OVA IP and target IP with current target VC IP
        const url = 'https://10.160.131.87:31337/container/target/10.160.255.106/vch?' +
          'thumbprint=' + payload.security.thumbprint;

        const body = this.processPayload(payload);

        console.log('processed payload: ', JSON.parse(JSON.stringify(body)));

        const headers  = new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Basic YWRtaW5pc3RyYXRvckB2c3BoZXJlLmxvY2FsOkFkbWluITIz'
        });

        const options  = new RequestOptions({ headers: headers });

        this.http.post(url, JSON.stringify(body), options)
          .map(response => response.json())
          .subscribe(response => {
            console.log(response);
            this.wizard.forceFinish();
            this.onCancel();
            this.refressher.refreshView();
          }, error => {
            console.error('error from api:', error);
            const response = JSON.parse(error._body);
            this.errorFlag = true;
            this.errorMsgs = [response.message];
          });
      }, errors => {
        console.error('error from form validations:', errors);
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

  get cachedData(): any {
    return this._cachedData;
  }

  /**
   * Transform wizard payload before sending it to vic-machine-service API
   */
  processPayload(payload) {

    const processedPayload = {
      'name': payload.name,
      'compute': {
        'cpu': {
          'limit': {
            // TODO: use selected unit from payload once units selectors are implemented
            'units': 'MHz',
            'value': payload.computeCapacity.cpu
          }
        },
        'memory': {
          'limit': {
            'units': 'MiB',
            'value': payload.computeCapacity.memory
          }
        },
        'resource': {
          'name': payload.computeCapacity.computeResource
        }
      },
      'storage': {
        'image_stores': [
          payload.storageCapacity.imageStore + (payload.storageCapacity.fileFolder || '')
        ],
        'base_image_size': {
          'units': payload.storageCapacity.baseImageSizeUnit,
          'value': payload.storageCapacity.baseImageSize
        }
      },
      'network': {
        'bridge': {
          'ip_range': payload.networks.bridgeNetworkRange,
          'port_group': {'name': payload.networks.bridgeNetwork}
        },
        'public': {
          'port_group': {'name': payload.networks.publicNetwork}
        }
      },
      'auth': {}
    };

    if (payload.debug) {
      processedPayload['debug'] = payload.debug;
    }

    if (payload.computeCapacity.cpuReservation) {
      processedPayload.compute.cpu['reservation'] = {
        'units': 'MHz',
        'value': payload.computeCapacity.cpuReservation
      };
      processedPayload.compute.cpu['shares'] = {
        'level': payload.computeCapacity.cpuShares
      };
      processedPayload.compute.memory['reservation'] = {
        'units': 'MiB',
        'value': payload.computeCapacity.memoryReservation
      };
      processedPayload.compute.memory['shares'] = {
        'level': payload.computeCapacity.memoryShares
      };
      processedPayload['endpoint'] = {
        cpu: {
          'sockets': payload.computeCapacity.endpointCpu
        },
        memory: {
          'units': 'MiB',
          'value': payload.computeCapacity.endpointMemory
        }
      }
    }

    // TODO: map networks settings

    if (payload.storageCapacity.volumeStores.length) {
      processedPayload.storage['volume_stores'] = payload.storageCapacity.volumeStores.map(vol => {
        return {
          'datastore': vol.volDatastore + (vol.volFileFolder || ''),
          'label': vol.dockerVolName
        };
      })
    }

    let auth: any;

    if (payload.security.noTls) {
      auth = {'no_tls': true}
    } else {

      auth = {
        client: {},
        server: {}
      };

      if (payload.security.noTlsverify) {
        auth.client = {'no_tls_verify': true};
      } else {
        auth.client = {'certificate_authorities': payload.security['tlsCa'].map(cert => ({pem: cert.content}))};
      }

      if (payload.security.certificateKeySize) {
        auth.server = {
          generate: {
            size: {
              'value': parseInt(payload.security.certificateKeySize),
              'units': 'bit'
            },
            organization: [payload.security.organization],
            cname: payload.security.tlsCname
          }
        }
      } else {
        auth.server = {
          certificate: {'pem': payload.security.tlsServerCert.content},
          private_key: {'pem': payload.security.tlsServerKey.content}
        }
      }
    }

    processedPayload['auth'] = auth;

    // TODO: map ops user for endpoint settings

    const registry: any = {};

    if (payload.whitelistRegistry && payload.whitelistRegistry.length) {
      registry['whitelist'] = payload.whitelistRegistry;
    }

    if (payload.insecureRegistry && payload.insecureRegistry.length) {
      registry['insecure'] = payload.insecureRegistry;
    }

    if (payload.registryCa && payload.registryCa.length) {
      registry['certificate_authorities'] = payload.registryCa.map(cert => ({pem: cert.content}));
    }

    if (payload.networks.httpProxy || payload.networks.httpsProxy) {
      registry['image_fetch_proxy'] = {};

      if (payload.networks.httpProxy) {
        registry['image_fetch_proxy']['http'] = payload.networks.httpProxy;
      }

      if (payload.networks.httpsProxy) {
        registry['image_fetch_proxy']['https'] = payload.networks.httpsProxy;
      }
    }

    return processedPayload;
  }
}
