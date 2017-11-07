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
import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CreateVchWizardService } from '../create-vch-wizard.service';
import { Observable } from 'rxjs/Observable';
import { camelCasePattern } from '../../shared/utils/validators';
import { getClientOS } from '../../shared/utils/detection'
import { isUploadableFileObject } from '../../shared/utils/model-checker';

// TODO: refactor & clean up the template
@Component({
  selector: 'vic-vch-creation-summary',
  templateUrl: './summary.html',
  styleUrls: ['./summary.scss']
})
export class SummaryComponent implements OnInit {
  public form: FormGroup;
  @Input() payload: any;
  public targetOS: string;
  public copySucceeded: boolean = null;
  private _isSetup = false;
  public isApplianceUnavailable: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private createWzService: CreateVchWizardService
  ) {
    this.form = formBuilder.group({
      targetOS: '',
      cliCommand: ''
    });
  }

  ngOnInit() {

  }

  /**
   * On WizardPage load event, start listening for events on inputs
   */
  onPageLoad(): void {
    // refresh cli value based on any changes made to the previous pages
    this.form.get('cliCommand').setValue(this.stringifyProcessedPayload());

    // look up the ip address of the newest vic appliance
    this.isApplianceUnavailable = undefined;
    this.createWzService
      .getVicApplianceIp()
      .subscribe(resp => {
        this.isApplianceUnavailable = false;
      }, err => {
        this.isApplianceUnavailable = true;
      });

    // prevent subscription from getting set up more than once
    if (this._isSetup) {
      return;
    }

    /**
     *  Subscribe to os changes
     *  we have to subscribe to this individually instead of the whole form
     *  since we are manually setting a change on the cli field
     */
    this.form.get('targetOS').valueChanges
      .subscribe(v => {
        if (!v) {
          return;
        }
        this.targetOS = v;
        this.form.get('cliCommand').setValue(this.stringifyProcessedPayload());
      });

    this.setDefaultOS();

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
   * default to users OS
   */
  setDefaultOS(): void {
    this.form.patchValue({ 'targetOS': getClientOS() });
  }

  /**
   * Convert camelcase keys into dash-separated ones, remove fields with
   * an empty array, and then return the array joined
   * @returns {string} vic-machine compatible arguments
   */
  stringifyProcessedPayload(): string {
    if (!this.targetOS) {
      return null;
    }

    const payload = this.processPayload();
    const results = [];

    let vicMachineBinary = `vic-machine-${this.targetOS}`;
    const createCommand = 'create';
    if (this.targetOS !== 'windows') {
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

            let stringValue;
            const rawValue = value[i];
            if (typeof rawValue === 'string') {
              stringValue = rawValue;
            } else if (typeof rawValue === 'object' &&
              isUploadableFileObject(rawValue)) {
              stringValue = rawValue.name;
            }

            results.push(`--${newKey} ${stringValue}`);
          }
        }
      }
    }

    return results.join(' ');
  }

  /**
   * Transform payload to something vic-machine command friendly
   */
  private processPayload(): any {
    const results = JSON.parse(JSON.stringify(this.payload));

    // transform image store entry
    results['storageCapacity']['imageStore'] =
      results['storageCapacity']['imageStore'] + (results['storageCapacity']['fileFolder'] || '');
    delete results['storageCapacity']['fileFolder'];

    results['storageCapacity']['baseImageSize'] = results['storageCapacity']['baseImageSize']
      + results['storageCapacity']['baseImageSizeUnit'].replace('i', '');
    delete results['storageCapacity']['baseImageSizeUnit'];

    // transform each volume store entry
    const volumeStoresRef = results['storageCapacity']['volumeStores'];
    results['storageCapacity']['volumeStores'] =
      volumeStoresRef.map(volStoreObj => {
        return `${volStoreObj['volDatastore']}${volStoreObj['volFileFolder']}:${volStoreObj['dockerVolName']}`;
      });

    // transform gateways with routing destinations

    if (results['networks']['clientNetworkRouting']) {
      results['networks']['clientNetworkGateway'] =
        results['networks']['clientNetworkRouting'].join(',') + ':' + results['networks']['clientNetworkGateway'];
      delete results['networks']['clientNetworkRouting'];
    }

    if (results['networks']['managementNetworkRouting']) {
      results['networks']['managementNetworkGateway'] =
        results['networks']['managementNetworkRouting'].join(',') + ':' + results['networks']['managementNetworkGateway'];
      delete results['networks']['clientNetworkRouting'];
    }

    // transform each container network entry
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

    // transform server cert and key

    if (results['security']['tlsServerCert']) {
      results['security']['tlsServerCert'] = results['security']['tlsServerCert']['name']
    }

    if (results['security']['tlsServerKey']) {
      results['security']['tlsServerKey'] = results['security']['tlsServerKey']['name']
    }

    return results;
  }

  /**
   * Emit the payload that will be sent to vic-machine API endpoint
   * @returns {Observable<any>}
   */
  onCommit(): Observable<any> {
    return Observable.of(this.payload);
  }
}
