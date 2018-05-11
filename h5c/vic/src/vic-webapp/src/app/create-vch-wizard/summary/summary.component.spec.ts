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
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SummaryComponent } from './summary.component';
import {CliCommandComponent} from '../../shared/components/cli-command/cli-command.component';

describe('SummaryComponent', () => {

  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        ClarityModule,
        NoopAnimationsModule
      ],
      declarations: [
        SummaryComponent,
        CliCommandComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    component.payload = {
      storageCapacity: {
        imageStore: 'datastore',
        baseImageSizeUnit: 'GiB',
        volumeStore: []
      },
      networks: {
        containerNetworks: []
      },
      security: {},
      operations: {}
    };
    component.onPageLoad();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
