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
import { supportedCharsPattern } from '../../shared/utils/validators';

@Component({
  selector: 'vic-vch-creation-name',
  templateUrl: './vch-creation-wizard-name.html',
  styleUrls: ['./vch-creation-wizard-name.scss']
})
export class VchCreationWizardNameComponent implements OnInit {
  public form: FormGroup;
  public signpostOpenState = false;

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
      ]
    });

    // TODO: add syslog field and change name step to general settings
    // TODO: add container vm template name fields
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
        return Observable.of({ name: this.form.get('name').value });
      });
  }
}
