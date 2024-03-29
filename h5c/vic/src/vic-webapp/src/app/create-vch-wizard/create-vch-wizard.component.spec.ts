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

import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { ComputeCapacityComponent } from './compute-capacity/compute-capacity.component';
import { ComputeResourceTreenodeComponent } from './compute-capacity/compute-resource-treenode.component';
import { CreateVchWizardComponent } from './create-vch-wizard.component';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { AppAlertService, GlobalsService, I18nService } from 'app/shared';
import { HttpModule } from '@angular/http';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { NetworksComponent } from './networks/networks.component';
import { Observable, of } from 'rxjs';
import { OperationsUserComponent } from './operations-user/operations-user.component';
import { RefreshService } from '../shared/refresh.service';
import { SecurityComponent } from './security/security.component';
import { StorageCapacityComponent } from './storage-capacity/storage-capacity.component';
import { SummaryComponent } from './summary/summary.component';
import { VchCreationWizardGeneralComponent } from './general/general.component';
import { RegistryAccessComponent } from './registry-access/registry-access.component';

describe('CreateVchWizardComponent', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
  let component: CreateVchWizardComponent;
  let fixture: ComponentFixture<CreateVchWizardComponent>;
  let service: CreateVchWizardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        FormsModule,
        HttpModule,
        ReactiveFormsModule,
        ClarityModule,
      ],
      providers: [
        I18nService,
        AppAlertService,
        {
          provide: GlobalsService, useValue: {
            getWebPlatform: () => {
              return {
                closeDialog: () => { },
                getUserSession: () => {
                  return {
                    serversInfo: []
                  };
                }
              };
            },
            getPluginLinkVersion() {
              return '1.5';
            }
          }
        },
        {
          provide: CreateVchWizardService, useValue: {
            checkVchNameUniqueness: (name) => {
              // TODO: check if this makes sense
              return of(name === 'unique');
            },
            getVicApplianceIp: (): Observable<string> => {
              return of('10.20.250.255');
            },
            getCloneTicket: () => of(''),
            getClustersList: () => of([]),
            getDatastores: () => of([])
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
        ComputeResourceTreenodeComponent,
        StorageCapacityComponent,
        NetworksComponent,
        SecurityComponent,
        RegistryAccessComponent,
        OperationsUserComponent,
        SummaryComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVchWizardComponent);
    component = fixture.componentInstance;
    service = TestBed.get(CreateVchWizardService);
    spyOn(component, 'resizeToParentFrame').and.callThrough();
    fixture.detectChanges();
  });

  // it('should be created', async(() => {
  //   expect(component).toBeTruthy();
  // }));

  // it('should have called wizard.open', async(() => {
  //   if (component && component.wizard !== undefined) {
  //     expect(component.resizeToParentFrame).toHaveBeenCalled()
  //   }
  // }));

});
