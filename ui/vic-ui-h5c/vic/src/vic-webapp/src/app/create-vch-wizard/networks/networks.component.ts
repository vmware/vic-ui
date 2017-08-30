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
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { CreateVchWizardService } from '../create-vch-wizard.service';
import { supportedCharsPattern, ipPattern} from '../../shared/utils/regex';

@Component({
    selector: 'vic-vch-creation-networks',
    templateUrl: './networks.html',
    styleUrls: ['./networks.scss']
})
export class NetworksComponent implements OnInit {
    public form: FormGroup;
    public formErrMessage = '';
    public inAdvancedMode = false;
    public portgroupsLoading = true;
    public portgroups: any[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private createWzService: CreateVchWizardService
    ) {
        this.form = formBuilder.group({
            bridgeNetwork: ['', Validators.required],
            bridgeNetworkRange: ['172.16.0.0/12', Validators.required],
            publicNetwork: ['', Validators.required],
            publicNetworkIp: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            publicNetworkType: 'dhcp',
            publicNetworkGateway: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            clientNetwork: '',
            managementNetwork: '',
            managementNetworkIp: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            managementNetworkType: 'dhcp',
            managementNetworkGateway: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            containerNetworks: formBuilder.array([this.createNewContainerNetworkEntry()]),
            httpProxy: '',
            httpProxyPort: '',
            httpsProxy: '',
            httpsProxyPort: '',
            dnsServer: ''
        });
    }

    // TODO: function that calls a service's method to load WIP data and replace form values

    ngOnInit() {

    }

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

    createNewContainerNetworkEntry() {
        return this.formBuilder.group({
            containerNetwork: '',
            containerNetworkIpRange: [{ value: '', disabled: true }, Validators.required],
            containerNetworkType: [{value: 'dhcp', disabled: true}],
            containerNetworkDns: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            containerNetworkGateway: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(ipPattern)
            ]],
            containerNetworkLabel: [{ value: '', disabled: true }, [
                Validators.required,
                Validators.pattern(supportedCharsPattern)
            ]]
        });
    }

    onPageLoad() {

        if (this.portgroups.length) {
            return;
        }

        this.form.get('publicNetworkType').valueChanges
            .subscribe(v => {
                if (v === 'dhcp') {
                    this.form.get('publicNetworkIp').disable();
                    this.form.get('publicNetworkGateway').disable();
                } else {
                    this.form.get('publicNetworkIp').enable();
                    this.form.get('publicNetworkGateway').enable();
                }
            });

        this.form.get('managementNetworkType').valueChanges
            .subscribe(v => {
                if (v === 'dhcp') {
                    this.form.get('managementNetworkIp').disable();
                    this.form.get('managementNetworkGateway').disable();
                } else {
                    this.form.get('managementNetworkIp').enable();
                    this.form.get('managementNetworkGateway').enable();
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

                    if (networkControl.value) {
                        if (labelControl.disabled) {
                            labelControl.enable();
                        }
                        if (networkTypeControl.disabled) {
                            networkTypeControl.enable();
                        }
                        if (networkTypeControl.value === 'static') {
                            if (ipRangeControl.disabled) {
                                ipRangeControl.enable();
                            }
                            if (gatewayControl.disabled) {
                                gatewayControl.enable();
                            }
                            if (dnsControl.disabled) {
                                dnsControl.enable();
                            }
                        } else {
                            if (ipRangeControl.enabled) {
                                ipRangeControl.disable();
                            }
                            if (gatewayControl.enabled) {
                                gatewayControl.disable();
                            }
                            if (dnsControl.enabled) {
                                dnsControl.disable();
                            }
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
                    }
                });
            });

        // load portgroups
        this.createWzService.getDistributedPortGroups()
            .subscribe(v => {
                this.portgroups = v;
                this.form.get('bridgeNetwork').setValue('');
                this.form.get('publicNetwork').setValue('');
                this.form.get('clientNetwork').setValue('');
                this.form.get('managementNetwork').setValue('');
                this.portgroupsLoading = false;
            }, err => console.error(err));
    }

    /**
     */
    onCommit(): Observable<any> {
        const results: any = {};

        results['bridgeNetwork'] = this.form.get('bridgeNetwork').value;
        if (this.form.get('bridgeNetworkRange').value) {
            results['bridgeNetworkRange'] = this.form.get('bridgeNetworkRange').value;
        }
        results['publicNetwork'] = this.form.get('publicNetwork').value;
        if (this.form.get('publicNetworkType').value === 'static') {
            results['publicNetworkIp'] = this.form.get('publicNetworkIp').value;
            results['publicNetworkGateway'] = this.form.get('publicNetworkGateway').value;
        }
        if (this.form.get('clientNetwork').value) {
            results['clientNetwork'] = this.form.get('clientNetwork').value;
        }
        if (this.form.get('managementNetwork').value) {
            results['managementNetwork'] = this.form.get('managementNetwork').value;
            if (this.form.get('managementNetworkType').value === 'static') {
                results['managementNetworkIp'] = this.form.get('managementNetworkIp').value;
                results['managementNetworkGateway'] = this.form.get('managementNetworkGateway').value;
            }
        }

        const httpProxyValue = this.form.get('httpProxy').value;
        const httpProxyPortValue = this.form.get('httpProxyPort').value;
        const httpsProxyValue = this.form.get('httpsProxy').value;
        const httpsProxyPortValue = this.form.get('httpsProxyPort').value;

        if (this.inAdvancedMode) {
            results['containerNetworks'] = this.form.get('containerNetworks')
                .value
                .filter(entry => entry['containerNetwork']);

            if (httpProxyValue && httpProxyPortValue) {
                results['httpProxy'] = `http://${httpProxyValue}:${httpProxyPortValue}`;
            }

            if (httpsProxyValue && httpsProxyPortValue) {
                results['httpsProxy'] = `https://${httpsProxyValue}:${httpsProxyPortValue}`;
            }

            const dnsServerValue = this.form.get('dnsServer').value.trim();
            if (dnsServerValue) {
                results['dnsServer'] = dnsServerValue;
            }
        } else {
            results['containerNetworks'] = [];
        }

        return Observable.of({ networks: results });
    }

    toggleAdvancedMode() {
        this.inAdvancedMode = !this.inAdvancedMode;
    }
}
