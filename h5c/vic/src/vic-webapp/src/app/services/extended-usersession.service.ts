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

import { Globals, GlobalsService } from '../shared';

import { Http } from '@angular/http';
import { IExtendedServerInfo } from './extended-serverinfo.interface';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExtendedUserSessionService {
    public readonly IS_VSPHERE_ADMIN_QUERY_URL = '/ui/vic/rest/services/is-user-vsphere-admin';
    private _serversInfo: IExtendedServerInfo[] = [];
    private _samlTokenXml: string;
    private _isUserVsphereAdmin: boolean;
    public locale: string;

    /**
     * Cache some information from the raw output of userSession() and
     * drop out unnecessary information
     * @param {GlobalsService} globalsService - GlobalsService from web-platform.js
     * @param {Http} http
     */
    constructor(
      private globalsService: GlobalsService,
      private http: Http
    ) {
        const wp = this.globalsService.getWebPlatform();
        // bypass initialization if user session is not available
        if (this.globalsService.isPluginMode() && wp.getUserSession) {
            const { locale, serversInfo, samlTokenXml } = <any>wp.getUserSession();
            this._samlTokenXml = samlTokenXml;
            this.locale = locale;
            for (let i = 0; i < serversInfo.length; i++) {
                const { name, serverGuid, sessionCookie, thumbprint, version } = serversInfo[i];
                this._serversInfo.push({
                    name: name,
                    serverGuid: serverGuid,
                    sessionCookie: sessionCookie,
                    thumbprint: thumbprint,
                    version: version
                });
            }
        }
    }

    /**
     * Return if the current user is a vSphere admin
     * @returns {boolean}
     */
    get isVsphereAdmin$(): Observable<boolean> {
        if (this._isUserVsphereAdmin !== undefined) {
            return Observable.of(this._isUserVsphereAdmin);
        }

        return this.http.get(this.IS_VSPHERE_ADMIN_QUERY_URL)
            .catch(err => Observable.throw(err))
            .map(response => response.json())
            .do(response => {
                this._isUserVsphereAdmin = response;
            });
    }

    /**
     * Return SAML token
     * @returns {string}
     */
    get samlTokenXml(): string {
        return this._samlTokenXml;
    }

    /**
     * Return the ExtendedServersInfo array
     * @return {IExtendedServerInfo[]}
     */
    getVcenterServersInfo(): IExtendedServerInfo[] {
        return this._serversInfo;
    }
}
