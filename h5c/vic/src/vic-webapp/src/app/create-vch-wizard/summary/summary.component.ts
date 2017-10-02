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
  public formErrMessage = '';
  @Input() payload: any;
  public processedPayload: any;
  public targetOS: string;
  public copySucceeded: boolean = null;
  private _isSetup = false;

  constructor(
    private formBuilder: FormBuilder,
    private elementRef: ElementRef
  ) {
    this.processedPayload = null;
    this.form = formBuilder.group({
      debug: '0',
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
    // refresh based on any changes made to the previous pages

    // prevent subscription from getting set up more than once
    if (this._isSetup) {
      return;
    }

    /**
     *  Subscribe to debug and os changes
     *  we have to subscribe to these individually instead of the whole form
     *  since we are manually setting a change on the cli field
     */
    this.form.get('debug').valueChanges.subscribe(data => {
      this.form.get('cliCommand').setValue(this.stringifyProcessedPayload());
    });

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

    this.setDefaultOS();
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

    this.processedPayload = this.processPayload();

    const payload = this.processedPayload;
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

    // debug
    results['debug'] = this.form.get('debug').value;

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
