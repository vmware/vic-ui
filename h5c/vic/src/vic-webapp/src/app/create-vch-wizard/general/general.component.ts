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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { CreateVchWizardService } from '../create-vch-wizard.service';
import { ipOrFqdnPattern, numberPattern, supportedCharsPattern } from '../../shared/utils/validators';

@Component({
  selector: 'vic-vch-creation-general',
  templateUrl: './general.html',
  styleUrls: ['./general.scss']
})
export class VchCreationWizardGeneralComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private createWzService: CreateVchWizardService
  ) {
    this.form = formBuilder.group({
      name: [
        'virtual-container-host',
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(supportedCharsPattern)
        ]
      ],
      containerNameConventionPrefix: '',
      containerNameConvention: '{name}',
      containerNameConventionPostfix: '',
      debug: '0',
      syslogTransport: 'tcp',
      syslogHost: [
        '',
        [
          Validators.pattern(ipOrFqdnPattern)
        ]
      ],
      syslogPort: [
        '',
        [
          Validators.maxLength(5),
          Validators.pattern(numberPattern)
        ]
      ]
    });
  }

  ngOnInit() { }

  onPageLoad() { }

  /**
   * Async validation for the Name section
   * This calls the VchCreationWizardService to check if the provided name
   * is unique among VirtualApps and ResourcePools on VC and then returns
   * an observable of the name or any error
   * @returns {Observable<any>}
   */
  onCommit(): Observable<any> {
    return this.createWzService.checkVchNameUniqueness(this.form.get('name').value)
      .switchMap(isUnique => {
        if (!isUnique) {
          this.form.get('name').setErrors({
            resourcePoolExists: true
          });
          return Observable.throw(null);
        }

        const results = {
          general: {
            name: this.form.get('name').value,
            debug: this.form.get('debug').value
          }
        };

        const containerNameConventionPrefixValue = this.form.get('containerNameConventionPrefix').value;
        const containerNameConventionValue = this.form.get('containerNameConvention').value;
        const containerNameConventionPostfixValue = this.form.get('containerNameConventionPostfix').value;

        results['general']['containerNameConvention'] =
          containerNameConventionPrefixValue + containerNameConventionValue + containerNameConventionPostfixValue;

        const syslogTransportValue = this.form.get('syslogTransport').value;
        const syslogHostValue = this.form.get('syslogHost').value;
        const syslogPortValue = this.form.get('syslogPort').value;

        if (syslogHostValue && syslogPortValue) {
          results['general']['syslogAddress'] = `${syslogTransportValue}://${syslogHostValue}:${syslogPortValue}`;
        }

        return Observable.of(results);
      });
  }
}
