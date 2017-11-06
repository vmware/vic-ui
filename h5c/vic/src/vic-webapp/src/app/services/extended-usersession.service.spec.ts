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
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { ExtendedUserSessionService } from './extended-usersession.service';
import { GlobalsService } from '../shared';
import { IExtendedServerInfo } from './extended-serverinfo.interface';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { Subscription } from 'rxjs/Rx';
import {
  BaseRequestOptions,
  ConnectionBackend,
  Headers,
  Http,
  HttpModule,
  RequestOptions,
  Response,
  ResponseOptions,
  ResponseType,
  XHRBackend
} from '@angular/http';

describe('ExtendedUserSessionService', () => {
    let service: ExtendedUserSessionService;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;

    const getMockedGlobalsService = (serversInfo: IExtendedServerInfo[]) => {
        return {
            isPluginMode: () => {
                return true;
            },
            getWebPlatform: () => {
                return {
                    getUserSession() {
                        return {
                            locale: 'en_US',
                            serversInfo: serversInfo,
                            samlTokenXml: 'loremipsum'
                        };
                    }
                };
            }
        };
    };

    it('should return true for isVsphereAdmin for an admin user ', async(() => {
        let backend: MockBackend;
        let connection: MockConnection;
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: GlobalsService,
                    useValue: getMockedGlobalsService([])
                },
                ExtendedUserSessionService,
                Http,
                { provide: ConnectionBackend, useClass: MockBackend },
                { provide: RequestOptions, useClass: BaseRequestOptions }
            ]
        }).compileComponents();
        service = TestBed.get(ExtendedUserSessionService);
        backend = TestBed.get(ConnectionBackend);
        backend.connections.subscribe((c: MockConnection) => connection = c);

        service.isVsphereAdmin$.subscribe(results => {
            expect(results).toBeTruthy();
        });

        connection.mockRespond(new Response(new ResponseOptions({
          body: true
        })));

    }));

    it('should return false for isVsphereAdmin for a non-admin user', async(() => {
        let backend: MockBackend;
        let connection: MockConnection;
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: GlobalsService,
                    useValue: getMockedGlobalsService([])
                },
                ExtendedUserSessionService,
                Http,
                { provide: ConnectionBackend, useClass: MockBackend },
                { provide: RequestOptions, useClass: BaseRequestOptions }
            ]
        }).compileComponents();
        service = TestBed.get(ExtendedUserSessionService);
        backend = TestBed.get(ConnectionBackend);
        backend.connections.subscribe((c: MockConnection) => connection = c);

        service.isVsphereAdmin$.subscribe(results => {
            expect(results).toBeFalsy();
        });

        connection.mockRespond(new Response(new ResponseOptions({
          body: false
        })));
    }));

    it('should return locale, samlTokenXml and ServerInfos', async(() => {
        TestBed.configureTestingModule({
            imports: [ HttpModule ],
            providers: [
                {
                    provide: GlobalsService,
                    useValue: getMockedGlobalsService(
                        [{
                            name: 'test-name',
                            serverGuid: 'test-guid',
                            sessionCookie: 'test-cookie',
                            thumbprint: 'test-thumbprint',
                            version: 'test-version'
                        }])
                },
                ExtendedUserSessionService
            ]
        }).compileComponents();
        service = TestBed.get(ExtendedUserSessionService);

        expect(service.locale).toBe('en_US');
        expect(service.samlTokenXml).toBe('loremipsum');
        const serverInfos = service.getVcenterServersInfo();
        expect(serverInfos.length).toBe(1);
        expect(serverInfos[0]).toEqual({
            name: 'test-name',
            serverGuid: 'test-guid',
            sessionCookie: 'test-cookie',
            thumbprint: 'test-thumbprint',
            version: 'test-version'
        });
    }));
});
