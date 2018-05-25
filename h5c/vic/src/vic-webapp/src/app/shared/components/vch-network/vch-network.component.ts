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

import {Component, Input, OnInit} from '@angular/core';
import {VchComponentBase} from '../vch-component-base';
import {VchContainerNetworkUi, VchUiNetwork} from '../../../interfaces/vch';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {GlobalsService} from '../../globals.service';
import {ConfigureVchService} from '../../../configure/configure-vch.service';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {cidrPattern, ipPattern, numberPattern, supportedCharsPattern} from '../../utils/validators';
import {cidrListPattern, ipListPattern} from '../../utils';
import {ComputeResource} from '../../../interfaces/compute.resource';
import {I18nService} from '../../i18n.service';

@Component({
  selector: 'vic-vch-network',
  templateUrl: './vch-network.component.html',
  styleUrls: ['./vch-network.component.scss']
})
export class VchNetworkComponent extends VchComponentBase implements OnInit {

  @Input() resourceObjName: any;
  @Input() datacenter: ComputeResource;
  @Input() model: VchUiNetwork;

  protected readonly apiModelKey = 'networks';
  protected readonly initialModel: VchUiNetwork = {
    bridgeNetwork: '',
    bridgeNetworkRange: '172.16.0.0/12',
    publicNetwork: '',
    publicNetworkIp: '',
    publicNetworkType: 'dhcp',
    publicNetworkGateway: '',
    dnsServer: [],
    clientNetwork: '',
    clientNetworkIp: '',
    clientNetworkType: 'dhcp',
    clientNetworkGateway: '',
    clientNetworkRouting: '',
    managementNetwork: '',
    managementNetworkIp: '',
    managementNetworkType: 'dhcp',
    managementNetworkGateway: '',
    managementNetworkRouting: '',
    containerNetworks: [],
    httpProxy: '',
    httpProxyPort: '',
    httpsProxy: '',
    httpsProxyPort: ''
  };

  public inAdvancedMode = false;
  public portgroupsLoading = true;
  public portgroups: any[] = [];
  public bridgeNetworkExpanded = false;
  public publicNetworkExpanded = false;
  public clientNetworkExpanded = false;
  public managementNetworkExpanded = false;
  public containerNetworksExpanded: boolean[] = [];

  constructor(
    protected formBuilder: FormBuilder,
    protected createWzService: CreateVchWizardService,
    protected globalsService: GlobalsService,
    protected configureService: ConfigureVchService,
    public i18n: I18nService
  ) {
    super(formBuilder, createWzService, globalsService, configureService);
    this.updateCurrentForm(this.initialModel);
  }

  ngOnInit() {
    if (this.model) {
      if (this.model.clientNetwork || this.model.managementNetwork ||
        (this.model.containerNetworks && this.model.managementNetwork.length > 0)) {
        this.model.containerNetworks.forEach(container => this.containerNetworksExpanded.push(false));
        this.inAdvancedMode = true;
      }
    }
    super.ngOnInit();
  }

  protected updateCurrentForm(model: VchUiNetwork) {
    this.form = this.formBuilder.group({
      bridgeNetwork: [model.bridgeNetwork, Validators.required],
      bridgeNetworkRange: [model.bridgeNetworkRange, Validators.required],
      publicNetwork: [model.publicNetwork, Validators.required],
      publicNetworkIp: [{
        value: model.publicNetworkIp,
        disabled: model.publicNetworkIp || model.publicNetworkType === 'static' ? false : true
      }, [
        Validators.required,
        Validators.pattern(cidrPattern)
      ]],
      publicNetworkType: model.publicNetworkType,
      publicNetworkGateway: [{ value: model.publicNetworkGateway,
        disabled: model.publicNetworkGateway || model.publicNetworkType === 'static'  ? false : true
      }, [
        Validators.required,
        Validators.pattern(ipPattern)
      ]],
      dnsServer: [model.dnsServer, Validators.pattern(ipListPattern)],
      clientNetwork: model.clientNetwork,
      clientNetworkIp: [{
        value: model.clientNetworkIp,
        disabled: model.clientNetworkIp || model.clientNetworkType === 'static' ? false : true
      }, [
        Validators.required,
        Validators.pattern(cidrPattern)
      ]],
      clientNetworkType: model.clientNetworkType,
      clientNetworkGateway: [{ value: model.clientNetworkGateway,
        disabled: model.clientNetworkGateway || model.clientNetworkType === 'static' ? false : true
      }, [
        Validators.required,
        Validators.pattern(ipPattern)
      ]],
      clientNetworkRouting: [{ value: model.clientNetworkRouting, disabled: model.clientNetworkRouting ? false : true }, [
        Validators.pattern(cidrListPattern)
      ]],
      managementNetwork: model.managementNetwork,
      managementNetworkIp: [{
        value: model.managementNetworkIp,
        disabled: model.managementNetworkIp || model.managementNetworkType === 'static' ? false : true
      }, [
        Validators.required,
        Validators.pattern(cidrPattern)
      ]],
      managementNetworkType: model.managementNetworkType,
      managementNetworkGateway: [{ value: model.managementNetworkGateway,
        disabled: model.managementNetworkGateway || model.managementNetworkType === 'static' ? false : true
      }, [
        Validators.required,
        Validators.pattern(ipPattern)
      ]],
      managementNetworkRouting: [{ value: model.managementNetworkRouting, disabled: model.managementNetworkRouting ? false : true }, [
        Validators.pattern(cidrListPattern)
      ]],
      containerNetworks: this.formBuilder.array(model.containerNetworks.length > 0 ?
        this.model.containerNetworks
          .map(container => this.createNewContainerNetworkEntry(container)) : [this.createNewContainerNetworkEntry()]),
      httpProxy: model.httpProxy,
      httpProxyPort: [
        model.httpProxyPort,
        [
          Validators.maxLength(5),
          Validators.pattern(numberPattern)
        ]
      ],
      httpsProxy: model.httpsProxy,
      httpsProxyPort: [
        model.httpsProxyPort,
        [
          Validators.maxLength(5),
          Validators.pattern(numberPattern)
        ]
      ]
    });
  }

  protected updateCurrentModel() {
    if (this.form.valid || this.readOnly) {
      const currentModel: VchUiNetwork = {
        bridgeNetwork: this.form.get('bridgeNetwork').value,
        publicNetwork: this.form.get('publicNetwork').value,
        publicNetworkType: this.form.get('publicNetworkType').value,
      };

      if (this.form.get('bridgeNetworkRange').value) {
        currentModel.bridgeNetworkRange = this.form.get('bridgeNetworkRange').value;
      }

      if (this.form.get('publicNetworkType').value === 'static') {
        currentModel.publicNetworkIp = this.form.get('publicNetworkIp').value;
        currentModel.publicNetworkGateway = this.form.get('publicNetworkGateway').value;
      }

      if (this.form.get('dnsServer').value) {
        currentModel.dnsServer = Array.isArray(this.form.get('dnsServer').value) ?
          this.form.get('dnsServer').value.map(v => v.trim()) : this.form.get('dnsServer').value.split(',').map(v => v.trim());
      }

      const httpProxyValue = this.form.get('httpProxy').value;
      const httpProxyPortValue = this.form.get('httpProxyPort').value;
      const httpsProxyValue = this.form.get('httpsProxy').value;
      const httpsProxyPortValue = this.form.get('httpsProxyPort').value;

      if (this.inAdvancedMode) {

        if (this.form.get('clientNetwork').value) {
          currentModel.clientNetwork = this.form.get('clientNetwork').value;
          currentModel.clientNetworkType = this.form.get('clientNetworkType').value;

          if (this.form.get('clientNetworkType').value === 'static') {
            currentModel.clientNetworkIp = this.form.get('clientNetworkIp').value;
            currentModel.clientNetworkGateway = this.form.get('clientNetworkGateway').value;
            currentModel.clientNetworkRouting = this.form.get('clientNetworkRouting').value.split(',').map(v => v.trim());
          }
        }

        if (this.form.get('managementNetwork').value) {
          currentModel.managementNetwork = this.form.get('managementNetwork').value;
          currentModel.managementNetworkType = this.form.get('managementNetworkType').value;

          if (this.form.get('managementNetworkType').value === 'static') {
            currentModel.managementNetworkIp = this.form.get('managementNetworkIp').value;
            currentModel.managementNetworkGateway = this.form.get('managementNetworkGateway').value;
            currentModel.managementNetworkRouting = this.form.get('managementNetworkRouting').value.split(',').map(v => v.trim());
          }
        }

        if (httpProxyValue && httpProxyPortValue) {
          currentModel.httpProxy = `http://${httpProxyValue}:${httpProxyPortValue}`;
        }

        if (httpsProxyValue && httpsProxyPortValue) {
          currentModel.httpsProxy = `https://${httpsProxyValue}:${httpsProxyPortValue}`;
        }

        currentModel.containerNetworks = this.form.get('containerNetworks')
          .value
          .filter(entry => entry['containerNetwork']);

      }

      this.model = currentModel;
    }

  }

  onCommit(): Observable<{ [key: string]: VchUiNetwork }> {
    return Observable.of({ [this.apiModelKey]: this.model });
  }

  // -----------------------------------------------------------------------------------

  addNewContainerNetworkEntry() {
    const containerNetworks = this.form.get('containerNetworks') as FormArray;
    const newContainerNetworkEntity = this.createNewContainerNetworkEntry();
    newContainerNetworkEntity.controls['containerNetworkLabel'].enable();
    containerNetworks.push(newContainerNetworkEntity);
  }

  removeContainerNetworkEntry(index: number) {
    const containerNetworks = this.form.get('containerNetworks') as FormArray;
    containerNetworks.removeAt(index);
  }

  createNewContainerNetworkEntry(container?: VchContainerNetworkUi) {
    return this.formBuilder.group({
      containerNetwork: container ? container.containerNetwork : '',
      containerNetworkType: [{value: container ? container.containerNetworkType : 'dhcp', disabled: true}],
      containerNetworkFirewall: [{ value: container ? container.containerNetworkFirewall : '', disabled: true }],
      containerNetworkIpRange: [{
        value: container ? container.containerNetworkIpRange : '',
        disabled: container && (container.containerNetworkIpRange || container.containerNetworkType === 'static') ? false : true},
        [Validators.required]],
      containerNetworkGateway: [{
        value: container ? container.containerNetworkGateway : '',
        disabled: container && (container.containerNetworkGateway || container.containerNetworkType === 'static') ? false : true},
        [Validators.required, Validators.pattern(ipPattern)]],
      containerNetworkDns: [{
        value: container ? container.containerNetworkDns : '',
        disabled: true},
        [Validators.pattern(ipPattern)]],
      containerNetworkLabel: [{
        value: container ? container.containerNetworkLabel : '',
        disabled: true },
        [Validators.required, Validators.pattern(supportedCharsPattern)]],
    });
  }

  loadPortgroups(computeResourceObjName: string) {
    this.portgroupsLoading = true;
    this.createWzService.getDistributedPortGroups(this.datacenter, computeResourceObjName)
      .subscribe(v => {
        this.portgroups = v;
        if (this.model && this.model.bridgeNetwork) {
          this.form.get('bridgeNetwork').setValue(this.getPortGroupText(this.model.bridgeNetwork));
        }
        if (this.model && this.model.publicNetwork) {
          this.form.get('publicNetwork').setValue(this.getPortGroupText(this.model.publicNetwork));
        }
        if (this.model && this.model.clientNetwork) {
          this.form.get('clientNetwork').setValue(this.getPortGroupText(this.model.clientNetwork));
        }
        if (this.model && this.model.managementNetwork) {
          this.form.get('managementNetwork').setValue(this.getPortGroupText(this.model.managementNetwork));
        }

        if (this.form.get('containerNetworks').value.length > 0) {
          const containerNetworks = this.form.get('containerNetworks') as FormArray;
          this.form.get('containerNetworks').value.forEach((control, index) => {
            containerNetworks.at(index).get('containerNetwork').setValue(this.getPortGroupText(control.containerNetwork));
          });
        }

        this.portgroupsLoading = false;
      }, err => console.error(err));
  }

  getPortGroupText(portgroupId: string): string {
    const portgroup = this.portgroups.find(pg => pg.objRef && pg.objRef.split(':')[3] === portgroupId);
    return portgroup ? portgroup.text : '';
  }

  onPageLoad() {
    if (this.portgroups.length) {
      this.loadPortgroups(this.resourceObjName);
      return;
    }

    this.form.get('publicNetworkType').valueChanges
      .subscribe(v => {
        if (v === 'dhcp') {
          this.form.get('publicNetworkIp').disable();
          this.form.get('publicNetworkGateway').disable();
          this.form.get('dnsServer').setValidators([
            Validators.pattern(ipListPattern)
          ]);
          this.form.get('dnsServer').updateValueAndValidity();
        } else {
          this.form.get('publicNetworkIp').enable();
          this.form.get('publicNetworkGateway').enable();
          this.form.get('dnsServer').setValidators([
            Validators.required,
            Validators.pattern(ipListPattern)
          ]);
          this.form.get('dnsServer').updateValueAndValidity();
        }
      });

    this.form.get('clientNetworkType').valueChanges
      .subscribe(v => {
        if (v === 'dhcp') {
          this.form.get('clientNetworkIp').disable();
          this.form.get('clientNetworkGateway').disable();
          this.form.get('clientNetworkRouting').disable();
        } else {
          this.form.get('clientNetworkIp').enable();
          this.form.get('clientNetworkGateway').enable();
          this.form.get('clientNetworkRouting').enable();
        }
      });

    this.form.get('managementNetworkType').valueChanges
      .subscribe(v => {
        if (v === 'dhcp') {
          this.form.get('managementNetworkIp').disable();
          this.form.get('managementNetworkGateway').disable();
          this.form.get('managementNetworkRouting').disable();
        } else {
          this.form.get('managementNetworkIp').enable();
          this.form.get('managementNetworkGateway').enable();
          this.form.get('managementNetworkRouting').enable();
        }
      });

    this.form.get('containerNetworks').valueChanges
      .subscribe(v => {
        v.forEach((item, index) => {
          const controls = this.form.get('containerNetworks')['controls'][index]['controls'];
          const networkControl = controls['containerNetwork'];
          const networkTypeControl = controls['containerNetworkType'];
          const labelControl = controls['containerNetworkLabel'];
          const ipRangeControl = controls['containerNetworkIpRange'];
          const gatewayControl = controls['containerNetworkGateway'];
          const dnsControl = controls['containerNetworkDns'];
          const firewallControl = controls['containerNetworkFirewall'];

          if (networkControl.value) {
            if (labelControl.disabled) {
              labelControl.enable();
            }
            if (networkTypeControl.disabled) {
              networkTypeControl.enable();
            }
            if (dnsControl.disabled) {
              dnsControl.enable();
            }
            if (firewallControl.disabled) {
              firewallControl.enable();
            }
            if (networkTypeControl.value === 'static') {
              if (ipRangeControl.disabled) {
                ipRangeControl.enable();
              }
              if (gatewayControl.disabled) {
                gatewayControl.enable();
              }
              dnsControl.setValidators([
                Validators.required,
                Validators.pattern(ipPattern)
              ]);
            } else {
              if (ipRangeControl.enabled) {
                ipRangeControl.disable();
              }
              if (gatewayControl.enabled) {
                gatewayControl.disable();
              }
              dnsControl.setValidators([
                Validators.pattern(ipPattern)
              ]);
            }
          } else {
            if (labelControl.enabled) {
              labelControl.disable();
            }
            if (networkTypeControl.enabled) {
              networkTypeControl.disable();
            }
            if (ipRangeControl.enabled) {
              ipRangeControl.disable();
            }
            if (gatewayControl.enabled) {
              gatewayControl.disable();
            }
            if (dnsControl.enabled) {
              dnsControl.disable();
            }
            if (firewallControl.enabled) {
              firewallControl.disable();
            }
            dnsControl.setValidators([
              Validators.pattern(ipPattern)
            ]);
          }

          dnsControl.updateValueAndValidity({onlySelf: false, emitEvent: false});
        });
      });

    // load portgroups
    this.loadPortgroups(this.resourceObjName);
  }

  toggleAdvancedMode() {
    this.inAdvancedMode = !this.inAdvancedMode;
    this.updateCurrentModel();
    this.emitCurrentModel();
  }

}

