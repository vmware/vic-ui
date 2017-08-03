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
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
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

    constructor(
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {

    }

    onPageLoad() {
        // TODO: remove
        console.log('pre commit', this.payload);
    }

    /**
     * Transform some fields before sending it to vic-machine API
     */
    onCommit(): Observable<any> {
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

        return Observable.of(results);
    }
}
