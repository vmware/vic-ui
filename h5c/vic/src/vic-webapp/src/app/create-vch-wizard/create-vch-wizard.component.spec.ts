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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { CreateVchWizardComponent } from './create-vch-wizard.component';
import { GlobalsService } from 'app/shared';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { Observable } from 'rxjs/Observable';
import { VchCreationWizardGeneralComponent } from './general/general.component';
import { ComputeCapacityComponent } from './compute-capacity/compute-capacity.component';
import { StorageCapacityComponent } from './storage-capacity/storage-capacity.component';
import { NetworksComponent } from './networks/networks.component';
import { SecurityComponent } from './security/security.component';
import { SummaryComponent } from './summary/summary.component';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { RefreshService } from '../shared/refresh.service';

describe('CreateVchWizardComponent', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
  let component: CreateVchWizardComponent;
  let fixture: ComponentFixture<CreateVchWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule,
        ReactiveFormsModule,
        ClarityModule,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: GlobalsService, useValue: {
            getWebPlatform: () => {
              return {
                closeDialog: () => { }
              };
            }
          }
        },
        {
          provide: CreateVchWizardService, useValue: {
            checkVchNameUniqueness: (name) => {
              // TODO: check if this makes sense
              return Observable.of(name === 'unique');
            },
            getClustersList: () => Observable.of([]),
            getDatastores: () => Observable.of([])
          }
        },
        {
          provide: RefreshService, useValue: {
            refresh: () => {}
          }
        }
      ],
      declarations: [
        CreateVchWizardComponent,
        VchCreationWizardGeneralComponent,
        ComputeCapacityComponent,
        StorageCapacityComponent,
        NetworksComponent,
        SecurityComponent,
        SummaryComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVchWizardComponent);
    component = fixture.componentInstance;
    spyOn(component, 'resizeToParentFrame').and.callThrough();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should have called wizard.open', async(() => {
    expect(component.resizeToParentFrame).toHaveBeenCalled();
  }));

});
