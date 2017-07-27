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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/observable/timer';

@Component({
    selector: 'vic-vch-creation-name',
    templateUrl: './vch-creation-wizard-name.html',
    styleUrls: ['./vch-creation-wizard-name.scss']
})
export class VchCreationWizardNameComponent implements OnInit {
    public form: FormGroup;
    public formErrMessage = 'Name cannot be empty!';

    constructor(
        private formBuilder: FormBuilder,
        private http: Http
    ) {
        // create form
        this.form = formBuilder.group({
            name: [
                '', // TODO: implement a function to load existing data
                [
                    Validators.required,
                    Validators.maxLength(80),
                    Validators.pattern(new RegExp(/^[\w-]+$/))
                ]
            ]
        });
    }

    // TODO: function that calls a service's method to load WIP data and replace form values

    ngOnInit() {
        // TODO: update value & validity only if there is a value already

        // handle synchronous validations
        this.form.get('name').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                const nameFormControl = this.form.get('name');
                if (nameFormControl.hasError('required')) {
                    this.formErrMessage = 'Name cannot be empty!';
                    return;
                }

                if (nameFormControl.hasError('maxlength')) {
                    this.formErrMessage = 'Name cannot be more than 80 characters long!';
                    return;
                }

                if (nameFormControl.hasError('pattern')) {
                    this.formErrMessage = 'Name contains characters that are not allowed!';
                    return;
                }
            });
    }

    /**
     * Async validation for the Name section
     * This calls the VchCreationWizardService to check if the provided name
     * is unique among VirtualApps and ResourcePools on VC and then returns
     * an observable of an array of errors
     * @returns {Observable<string[]>}
     */
    onCommit(): Observable<string[]> {
        // TODO: move the following into a service
        const params = new URLSearchParams();
        params.set('name', this.form.get('name').value);
        return this.http.post('/ui/vic/rest/services/check-rp-uniqueness', params)
            .catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e))
            .switchMap(isUnique => {
                if (!isUnique) {
                    this.form.get('name').setErrors({
                        resourcePoolExists: true
                    });
                    this.formErrMessage =
                        'There is already a VirtualApp or ResourcePool that exists with the same name!';
                }
                return Observable.of(isUnique ? null : [this.formErrMessage]);
            });
    }
}
