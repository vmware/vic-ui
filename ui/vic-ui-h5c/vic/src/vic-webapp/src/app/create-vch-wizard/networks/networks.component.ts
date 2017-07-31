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
import { Component, OnInit, EventEmitter } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/observable/timer';
import { CreateVchWizardService } from '../create-vch-wizard.service';

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
    public portgroups: any[] = null;

    constructor(
        private formBuilder: FormBuilder,
        private createWzService: CreateVchWizardService
    ) {
        // TODO: advanced validation logics
        this.form = formBuilder.group({
            bridgeNetwork: ['', Validators.required],
            bridgeNetworkRange: '172.16.0.0/12',
            publicNetwork: ['', Validators.required],
            publicNetworkIp: [{ value: '', disabled: true }, Validators.required],
            publicNetworkType: 'dhcp',
            publicNetworkGateway: [{ value: '', disabled: true }, Validators.required],
            clientNetwork: '',
            managementNetwork: '',
            managementNetworkIp: [{ value: '', disabled: true }, Validators.required],
            managementNetworkType: 'dhcp',
            managementNetworkGateway: [{ value: '', disabled: true }, Validators.required],
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
            containerNetworkType: 'dhcp',
            containerNetworkDns: [{ value: '', disabled: true }, Validators.required],
            containerNetworkGateway: [{ value: '', disabled: true }, Validators.required],
            containerNetworkLabel: [{ value: '', disabled: true }, Validators.required]
        });
    }

    onPageLoad() {
        if (this.portgroups !== null) {
            return;
        }

        this.form.get('bridgeNetwork').statusChanges
            .subscribe(v => {
                if (this.form.get('bridgeNetwork').hasError('required')) {
                    this.formErrMessage = 'Bridge network cannot be empty!';
                }
            });

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

        // load portgroups
        this.createWzService.getDistributedPortGroups()
            .subscribe(v => {
                this.portgroups = v;
                this.form.get('bridgeNetwork').setValue(v[0]['text']);
                this.form.get('publicNetwork').setValue(v[0]['text']);
                this.form.get('clientNetwork').setValue('');
                this.form.get('managementNetwork').setValue('');
                this.portgroupsLoading = false;
            }, err => console.error(err));
    }

    /**
     * Toggle IP and Gateway inputs for Container networks
     * @param {boolean} enable
     * @param {number} index
     */
    toggleNetworkIpGatewayDns(enable: boolean, index: number) {
        const controls = this.form.get('containerNetworks')['controls'][index]['controls'];
        if (enable) {
            controls['containerNetworkIpRange'].enable();
            controls['containerNetworkGateway'].enable();
            controls['containerNetworkDns'].enable();
        } else {
            controls['containerNetworkIpRange'].disable();
            controls['containerNetworkGateway'].disable();
            controls['containerNetworkDns'].disable();
        }
    }

    toggleNetworkLabel(enable: boolean, index: number) {
        const controls = this.form.get('containerNetworks')['controls'][index]['controls'];
        if (enable) {
            controls['containerNetworkLabel'].enable();
        } else {
            controls['containerNetworkLabel'].disable();
        }

    }

    /**
     */
    onCommit(): Observable<any> {
        const errs: string[] = [];
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
        if (this.inAdvancedMode) {
            results['containerNetworks'] = this.form.get('containerNetworks')
                .value
                .filter(entry => entry['containerNetwork']);

            const httpProxyValue = this.form.get('httpProxy').value;
            const httpProxyPortValue = this.form.get('httpProxyPort').value;
            const httpsProxyValue = this.form.get('httpsProxy').value;
            const httpsProxyPortValue = this.form.get('httpsProxyPort').value;

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
        const controls = this.form.get('containerNetworks')['controls'];
        controls.forEach((control, i) => {
            if (!this.inAdvancedMode) {
                this.toggleNetworkIpGatewayDns(false, i);
                this.toggleNetworkLabel(false, i);
            } else {
                const isStatic = control['controls']['containerNetworkType']['value'] === 'static';
                this.toggleNetworkIpGatewayDns(isStatic, i);
                this.toggleNetworkLabel(true, i);
            }
        });
    }
}
