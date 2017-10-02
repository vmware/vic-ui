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
import { TestBed, async } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import {
    BaseRequestOptions,
    ConnectionBackend,
    RequestOptions,
    Http,
    Response,
    ResponseOptions,
    ResponseType,
    XHRBackend,
    Headers
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { Globals, GlobalsService } from '../shared';

describe('CreateVchWizardService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
    let service: CreateVchWizardService;
    let connection: MockConnection;
    let backend: MockBackend;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                CreateVchWizardService,
                Http,
                { provide: ConnectionBackend, useClass: MockBackend },
                { provide: RequestOptions, useClass: BaseRequestOptions },
                Globals,
                GlobalsService
            ]
        }).compileComponents();
        service = TestBed.get(CreateVchWizardService);
        backend = TestBed.get(ConnectionBackend);
        backend.connections.subscribe((c: MockConnection) => connection = c);
    }));

    it('should exist', () => {
        expect(service).toBeTruthy();
    });

    it('should return Observable of true', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => {
                expect(value).toBe(true);
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: true
        })));
    }));

    it('should return Observable of false', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => {
                expect(value).toBe(false);
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: false
        })));
    }));

    it('should catch http error', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => { }, (err: Error) => {
                expect(err.message).toEqual('some http error');
            });
        connection.mockError(new Error('some http error'));
    }));

    it('should catch json parse error', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => { }, (err: Error) => {
                expect(err instanceof SyntaxError).toBeTruthy();
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: 'uhoh'
        })));
    }));
});
