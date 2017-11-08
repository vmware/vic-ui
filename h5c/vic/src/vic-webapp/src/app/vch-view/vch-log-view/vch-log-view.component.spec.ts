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

import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import {
  Http,
  ConnectionBackend,
  Response,
  ResponseOptions,
  RequestOptions,
  BaseRequestOptions,
} from '@angular/http';
import { By } from '@angular/platform-browser';
import {
  getVchResponseStub
} from '../../services/mocks/vch.response';
import { VicVchLogViewComponent } from './vch-log-view.component';
import { ClarityModule } from 'clarity-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Globals, GlobalsService } from '../../shared';
import { VirtualContainerHost } from '../vch.model';
import { VchVmResponse } from '../../interfaces/vm.interface';

describe('VicVchLogViewComponent', () => {
  let fixture: ComponentFixture<VicVchLogViewComponent>;
  let connection: MockConnection;
  let backend: MockBackend;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        ClarityModule,
      ],
      providers: [
        Http,
        { provide: ConnectionBackend, useClass: MockBackend },
        { provide: RequestOptions, useClass: BaseRequestOptions },
        Globals,
        {
          provide: GlobalsService,
          useValue: {
            getWebPlatform: () => ({
              getUserSession: () => ({
                serversInfo: [{ thumbprint: '00' }]
              })
            })
          }
        }
      ],
      declarations: [
        VicVchLogViewComponent
      ]
    });
    backend = TestBed.get(ConnectionBackend);
    backend.connections.subscribe((c: MockConnection) => connection = c);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent<VicVchLogViewComponent>(VicVchLogViewComponent);
    fixture.componentInstance.vch = new VirtualContainerHost(<VchVmResponse>getVchResponseStub().results['bla']);
  });

  it('should render log contents', () => {
    const response = 'Log contents';
    const logElement = By.css('.log-content pre small');

    fixture.componentInstance.ngOnInit();

    connection.mockRespond(new Response(new ResponseOptions({
      body: `"${ response }"`
    })));

    fixture.detectChanges();

    expect(fixture.debugElement.query(logElement).nativeElement.textContent.trim()).toBe(response);
  });
});
