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
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { CHECK_RP_UNIQUENESS_URL } from '../shared/constants';

@Injectable()
export class CreateVchWizardService {
    // TODO: make a proper interface
    private _vchManifest: any;

    constructor(
        private http: Http
    ) {
        this.getWipManifest();
    }

    /**
     * Validate the provided name against VC inventories in a way that
     * checks if there is any VirtualApp or ResourcePool with the same
     * @param {string} name Name provided by the user
     * @returns {Observable<boolean>} Observable containing whether the name is unique
     */
    checkVchNameUniqueness(name: string): Observable<boolean> {
        const params = new URLSearchParams();
        params.set('name', name);
        return this.http.post(CHECK_RP_UNIQUENESS_URL, params)
            .catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e));
    }

    /**
     * Look for the LocalStorage and get any 
     */
    getWipManifest() {

    }

    get vchManifest() {
        return this._vchManifest;
    }
}
