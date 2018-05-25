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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClarityModule } from '@clr/angular';
import { HttpModule } from '@angular/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Observable';
import { ReactiveFormsModule } from '@angular/forms';
import { TestScheduler } from 'rxjs/Rx';
import { CliCommandComponent } from './cli-command.component';
import {VchUiNetwork, VchUiStorage} from '../../../interfaces/vch';

describe('CLI Component', () => {

  let scheduler: TestScheduler;
  let component: CliCommandComponent;
  let fixture: ComponentFixture<CliCommandComponent>;

  const storageCapacity: VchUiStorage = {
    baseImageSize: '8',
    baseImageSizeUnit: 'GiB',
    fileFolder: '',
    imageStore: '',
    volumeStore: []
  };
  const networks: VchUiNetwork = {
    bridgeNetwork: '',
    bridgeNetworkRange: '172.16.0.0/12',
    publicNetwork: '',
    publicNetworkIp: '',
    publicNetworkType: 'dhcp',
    publicNetworkGateway: '',
    dnsServer: [],
    clientNetwork: '',
    clientNetworkIp: '',
    clientNetworkType: 'dhcp',
    clientNetworkGateway: '',
    clientNetworkRouting: '',
    managementNetwork: '',
    managementNetworkIp: '',
    managementNetworkType: 'dhcp',
    managementNetworkGateway: '',
    managementNetworkRouting: '',
    containerNetworks: [],
    httpProxy: '',
    httpProxyPort: '',
    httpsProxy: '',
    httpsProxyPort: ''
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule,
        NoopAnimationsModule
      ],
      declarations: [
        CliCommandComponent
      ]
    });
  });

  beforeEach(() => {
    // Set up TestScheduler to be used with Jasmine assertion
    scheduler = new TestScheduler((a, b) => {expect(a).toEqual(b)});
    const originalTimer = Observable.timer;

    // Monkey-patch Observable.timer to handle its async behavior using the TestScheduler
    spyOn(Observable, 'timer').and.callFake(
      (initialDelay, dueTime) => originalTimer.call(this, initialDelay, dueTime, scheduler)
    );

    fixture = TestBed.createComponent(CliCommandComponent);
    component = fixture.componentInstance;
    component.payload = Observable.of({
      storageCapacity: storageCapacity,
      networks: networks,
      security: {},
      operations: {}
    });
    // component.form.get('targetOS').setValue('windows');
    // component.onPageLoad();
  });

  it('should copy cli command to clipboard', () => {
    component.form.get('targetOS').setValue('darwin');
    component.copyCliCommand();

    // copySucceeded is set to false or true here to show an error or success message respectively
    expect(component.copySucceeded).not.toBe(null);

    // Schedule a time lapse
    scheduler.schedule(() => {
      // We expect it to return to null here to remove any error/success message
      expect(component.copySucceeded).toBe(null);
    }, 1500, null);

    // Advance in time to run the expect test inside the scheduler
    scheduler.flush();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form', () => {
    expect(component.form.valid).toBe(true);
  });
});
