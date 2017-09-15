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
  public formErrMessage = '';
  public signpostOpenState = false;

  constructor(
    private formBuilder: FormBuilder,
    private createWzService: CreateVchWizardService
  ) {
    // create a FormGroup instance for the 'name' field with
    // three synchronous validations - not empty, max char length of 80
    // and not containing any invalid characters
    this.form = formBuilder.group({
      name: [
        '', // TODO: implement a function to load existing data
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(supportedCharsPattern)
        ]
      ]
    });
  }

  // TODO: function that calls a service's method to load WIP data and replace form values

  ngOnInit() {
    // TODO: update value & validity only if there is a value already
  }

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
