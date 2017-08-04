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
import { Component, OnInit, EventEmitter, Input, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

// TODO: refactor & clean up the template
@Component({
    selector: 'vic-vch-creation-summary',
    templateUrl: './summary.html',
    styleUrls: ['./summary.scss']
})
export class SummaryComponent implements OnInit {
    public form: FormGroup;
    public formErrMessage = '';
    @Input() payload: any;
    public processedPayload: any;
    public targetOs: string;
    public copySucceeded: boolean = null;
    private _isSetup = false;

    constructor(
        private formBuilder: FormBuilder,
        private elementRef: ElementRef
    ) {
        this.processedPayload = null;
        this.form = formBuilder.group({
            targetOs: '',
            cliCommand: ''
        });
    }

    ngOnInit() {

    }

    /**
     * On WizardPage load event, start listening for events on inputs
     */
    onPageLoad(): void {
        // refresh based on any changes made to the previous pages
        this.processedPayload = this.processPayload();
        this.form.get('cliCommand').setValue(this.stringifyProcessedPayload());

        // prevent subscription from getting set up more than once
        if (this._isSetup) {
            return;
        }
        this.form.get('targetOs').valueChanges
            .subscribe(v => {
                if (!v) {
                    return;
                }
                const textareaNode = this.elementRef.nativeElement.querySelector('textarea#cliCommand');
                this.targetOs = v;
                this.form.get('cliCommand').setValue(this.stringifyProcessedPayload());
            });
        this._isSetup = true;
    }

    /**
     * Copy the content of the textarea to clipboard
     */
    copyCliCommandToClipboard(): void {
        const textareaNode = this.elementRef.nativeElement.querySelector('textarea#cliCommand');
        textareaNode.select();

        try {
            this.copySucceeded = window.document.execCommand('copy');
            Observable.timer(1500)
                .subscribe(() => {
                    this.copySucceeded = null;
                });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Convert camelcase keys into dash-separated ones, remove fields with
     * an empty array, and then return the array joined
     * @returns {string} vic-machine compatible arguments
     */
    stringifyProcessedPayload(): string {
        if (!this.targetOs) {
            return null;
        }

        const payload = this.processedPayload;
        const camelCasePattern = new RegExp(/([a-z])([A-Z])/g);
        const results = [];

        let vicMachineBinary = `vic-machine-${this.targetOs}`;
        const createCommand = 'create';
        if (this.targetOs !== 'windows')  {
            vicMachineBinary = `./${vicMachineBinary}`;
        }
        results.push(vicMachineBinary);
        results.push(createCommand);

        for (const section in payload) {
            if (!payload[section]) {
                continue;
            }

            // if there is only one entry in the section and it's of string type
            // add it to results array here
            if (typeof payload[section] === 'string') {
                results.push(`--${section} ${payload[section]}`);
                continue;
            }

            for (const key in payload[section]) {
                if (!payload[section][key]) {
                    continue;
                }
                const newKey = key.replace(camelCasePattern, '$1-$2').toLowerCase();
                const value = payload[section][key];
                if (typeof value === 'string') {
                    results.push(`--${newKey} ${value}`);
                } else if (typeof value === 'boolean') {
                    results.push(`--${newKey}`);
                } else {
                    // repeat adding multiple, optional fields with the same key
                    for (const i in value) {
                        if (!value[i]) {
                            continue;
                        }
                        results.push(`--${newKey} ${value[i]}`);
                    }
                }
            }
        }

        return results.join(' ');
    }

    /**
     * Transform some fields before sending it to vic-machine API
     */
    private processPayload(): any {
        const results = JSON.parse(JSON.stringify(this.payload));

        // transform image store entry to something vic-machine command friendly
        results['storageCapacity']['imageStore'] =
            results['storageCapacity']['imageStore'] + (results['storageCapacity']['fileFolder'] || '');
        delete results['storageCapacity']['fileFolder'];

        // transform each volume store entry to something vic-machine command friendly
        const volumeStoresRef = results['storageCapacity']['volumeStores'];
        results['storageCapacity']['volumeStores'] =
            volumeStoresRef.map(volStoreObj => {
                return `${volStoreObj['volDatastore']}${volStoreObj['volFileFolder']}:${volStoreObj['dockerVolName']}`;
            });

        // transform each container network entry to something vic-machine command friendly
        const containerNetworksRef = results['networks']['containerNetworks'];
        results['networks']['containerNetworks'] =
            containerNetworksRef.map(containerNetObj => {
                if (containerNetObj['containerNetworkType'] === 'dhcp') {
                    return {
                        containerNetwork: containerNetObj['containerNetwork'] +
                        ':' + containerNetObj['containerNetworkLabel']
                    };
                } else {
                    return {
                        containerNetwork: containerNetObj['containerNetwork'] +
                        ':' + containerNetObj['containerNetworkLabel'],
                        containerNetworkIpRange: containerNetObj['containerNetwork'] +
                        ':' + containerNetObj['containerNetworkIpRange'],
                        containerNetworkGateway: containerNetObj['containerNetwork'] +
                        ':' + containerNetObj['containerNetworkGateway'],
                        containerNetworkDns: containerNetObj['containerNetwork'] +
                        ':' + containerNetObj['containerNetworkDns']
                    };
                }
            });
        return results;
    }

    /**
     * Emit the processed payload that will be sent to vic-machine API endpoint 
     * @returns {Observable<any>}
     */
    onCommit(): Observable<any> {
        return Observable.of(this.processedPayload);
    }
}
