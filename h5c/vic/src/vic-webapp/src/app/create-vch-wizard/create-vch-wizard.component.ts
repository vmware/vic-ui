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
import { Wizard } from 'clarity-angular';

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
  onFinish(payloadObs: Observable<any> | null) {
    if (!this.loading && payloadObs) {

        // Acquire a clone ticket from vsphere for auth
        this.createWzService.acquireCloneTicket()
        .combineLatest(
          // Subscribe to payload observable
          payloadObs,
          this.createWzService.getVicApplianceIp()
        ).subscribe(([cloneTicket, payload, applianceIp]) => {

        if (payload) {

          this.errorFlag = false;
          this.loading = true;

          const vcIp = this.globalsService.getWebPlatform().getUserSession().serversInfo[0].name;

          if ((vcIp && applianceIp) && cloneTicket) {

              const url = 'https://' + applianceIp + ':' + VIC_APPLIANCE_PORT + '/container/target/' + vcIp + '/vch?' +
                  'thumbprint=' + payload.security.thumbprint;

              const body = this.processPayload(payload);

              console.log('processed payload: ', JSON.parse(JSON.stringify(body)));

              const options  = new RequestOptions({ headers: new Headers({
                  'Content-Type': 'application/json',
                  'X-VMWARE-TICKET': cloneTicket
              })});

              this.http.post(url, JSON.stringify(body), options)
                  .map(response => response.json())
                  .subscribe(response => {
                    console.log('success response:', response);
                    this.loading = false;
                    this.wizard.forceFinish();
                    this.onCancel();
                  }, error => {
                    console.error('error response:', error);
                    this.loading = false;
                    try {
                      error = error._body ? JSON.parse(error._body) : error;
                    } catch (e) {
                      console.log('error parsing:', e);
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

  /**
   * Transform wizard payload before sending it to vic-machine-service API
   */
  processPayload(payload) {

    const processedPayload = {
      'name': payload.general.name,
      'compute': {
        'cpu': {
          'limit': {
            // TODO: use selected unit from payload once units selectors are implemented
            'units': 'MHz',
            'value': parseInt(payload.computeCapacity.cpu, 10)
          }
        },
        'memory': {
          'limit': {
            'units': 'MiB',
            'value': parseInt(payload.computeCapacity.memory, 10)
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
          'value': parseInt(payload.storageCapacity.baseImageSize, 10)
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

    // General ---------------------------------------------------------------------------------------------------------

    // TODO: add vch vm name template

    if (payload.general.debug) {
      processedPayload['debug'] = parseInt(payload.general.debug, 10);
    }

    if (payload.general.syslogAddress) {
      processedPayload['syslog_addr'] = payload.general.syslogAddress;
    }

    // Compute ---------------------------------------------------------------------------------------------------------

    if (payload.computeCapacity.cpuReservation) {
      processedPayload.compute.cpu['reservation'] = {
        units: 'MHz',
        value: parseInt(payload.computeCapacity.cpuReservation, 10)
      };
      processedPayload.compute.cpu['shares'] = {
        level: payload.computeCapacity.cpuShares
      };
      processedPayload.compute.memory['reservation'] = {
        units: 'MiB',
        value: parseInt(payload.computeCapacity.memoryReservation, 10)
      };
      processedPayload.compute.memory['shares'] = {
        level: payload.computeCapacity.memoryShares
      };
    }

    // Endpoint --------------------------------------------------------------------------------------------------------

    processedPayload['endpoint'] = {
      operations_credentials: {
        user: payload.operations.opsUser,
        password: payload.operations.opsPassword
      }
    };

    if (payload.computeCapacity.endpointCpu) {
      processedPayload['endpoint']['cpu'] = {
        sockets: parseInt(payload.computeCapacity.endpointCpu, 10)
      };

      processedPayload['endpoint']['memory'] = {
        units: 'MiB',
        value: parseInt(payload.computeCapacity.endpointMemory, 10)
      };
    }

    // Storage ---------------------------------------------------------------------------------------------------------

    if (payload.storageCapacity.volumeStores.length) {
      processedPayload.storage['volume_stores'] = payload.storageCapacity.volumeStores.map(vol => {
        return {
          datastore: vol.volDatastore + (vol.volFileFolder || ''),
          label: vol.dockerVolName
        };
      })
    }

    // Networks --------------------------------------------------------------------------------------------------------

    if (payload.networks.publicNetworkIp) {
      processedPayload.network.public['static'] = {
        ip: payload.networks.publicNetworkIp
      };

      processedPayload.network.public['gateway'] = {
        address: payload.networks.publicNetworkGateway
      };

      if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
        processedPayload.network.public['nameservers'] = payload.networks.dnsServer;
      }
    }

    if (payload.networks.clientNetwork) {
      processedPayload.network['client'] = {
        port_group: {
          name: payload.networks.publicNetwork
        }
      };

      if (payload.networks.clientNetworkIp) {
        processedPayload.network['client']['static'] = {
          ip: payload.networks.clientNetworkIp
        };

        processedPayload.network['client']['gateway'] = {
          address: payload.networks.clientNetworkGateway
        };

        if (payload.networks.clientNetworkRouting && payload.networks.clientNetworkRouting.length) {
          processedPayload.network['client']['gateway']['routing_destinations'] = payload.networks.clientNetworkRouting;
        }

        if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
          processedPayload.network['client']['nameservers'] = payload.networks.dnsServer;
        }
      }
    }

    if (payload.networks.managementNetwork) {
      processedPayload.network['management'] = {
        port_group: {
          name: payload.networks.managementNetwork
        }
      };

      if (payload.networks.managementNetworkIp) {
        processedPayload.network['management']['static'] = {
          ip: payload.networks.managementNetworkIp
        };

        processedPayload.network['management']['gateway'] = {
          address: payload.networks.managementNetworkGateway
        };

        if (payload.networks.managementNetworkRouting && payload.networks.managementNetworkRouting.length) {
          processedPayload.network['management']['gateway']['routing_destinations'] = payload.networks.managementNetworkRouting;
        }

        if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
          processedPayload.network['management']['nameservers'] = payload.networks.dnsServer;
        }
      }
    }

    if (payload.networks.containerNetworks && payload.networks.containerNetworks.length) {
      processedPayload.network['container'] = payload.networks.containerNetworks.map(net => {
        const network = {
          port_group: {
            name: net.containerNetwork
          }
        };

        if (net.containerNetworkLabel) {
          network['alias'] = net.containerNetworkLabel;
        }

        if (net.containerNetworkIpRange) {
          network['ip_ranges'] = [net.containerNetworkIpRange];

          network['gateway'] = {
            address: net.containerNetworkGateway
          };

          network['nameservers'] = [net.containerNetworkDns];
        }

        return network;
      });
    }

    // Auth ------------------------------------------------------------------------------------------------------------

    let auth: any;

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
            value: parseInt(payload.security.certificateKeySize, 10),
            units: 'bit'
          },
          organization: [payload.security.organization],
          cname: payload.security.tlsCname
        }
      }
    } else if (payload.security.tlsServerCert) {
      auth.server = {
        certificate: {pem: payload.security.tlsServerCert.content},
        private_key: {pem: payload.security.tlsServerKey.content}
      }
    } else {
      auth.server = {
        generate: {
          size: {
            value: 2048,
            units: 'bits'
          },
          organization: [payload.general.name],
          cname: payload.general.name
        }
      }
    }

    processedPayload['auth'] = auth;

    // Registry --------------------------------------------------------------------------------------------------------

    const registry: any = {};

    if (payload.security.whitelistRegistry && payload.security.whitelistRegistry.length) {
      registry['whitelist'] = payload.security.whitelistRegistry;
    }

    if (payload.security.insecureRegistry && payload.security.insecureRegistry.length) {
      registry['insecure'] = payload.security.insecureRegistry;
    }

    if (payload.security.registryCa && payload.security.registryCa.length) {
      registry['certificate_authorities'] = payload.security.registryCa.map(cert => ({pem: cert.content}));
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

    processedPayload['registry'] = registry;

    return processedPayload;
  }
}
