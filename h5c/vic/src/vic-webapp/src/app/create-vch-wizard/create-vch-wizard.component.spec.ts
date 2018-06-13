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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';
import { CreateVchWizardComponent } from './create-vch-wizard.component';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { AppAlertService, GlobalsService, I18nService } from 'app/shared';
import { HttpModule } from '@angular/http';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { Observable } from 'rxjs/Observable';
import { RefreshService } from '../shared/refresh.service';
import { SummaryComponent } from './summary/summary.component';
import {VchGeneralComponent} from '../shared/components/vch-general/vch-general.component';
import {VchComputeComponent} from '../shared/components/vch-compute/vch-compute.component';
import {ComputeResourceTreenodeComponent} from '../shared/components/vch-compute/compute-resource-treenode.component';
import {CapitalizePipe} from '../shared/pipes/capitalize.pipe';
import {CliCommandComponent} from '../shared/components/cli-command/cli-command.component';
import {ConfigureVchService} from '../configure/configure-vch.service';
import {HttpClientModule} from '@angular/common/http';
import {VchStorageComponent} from '../shared/components/vch-storage/vch-storage.component';
import {VchNetworkComponent} from '../shared/components/vch-network/vch-network.component';
import {VchSecurityComponent} from '../shared/components/vch-security/vch-security.component';
import {VchRegistryComponent} from '../shared/components/vch-registry/vch-registry.component';
import {VchOperationsComponent} from '../shared/components/vch-operations/vch-operations.component';

describe('CreateVchWizardComponent', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
  let component: CreateVchWizardComponent;
  let fixture: ComponentFixture<CreateVchWizardComponent>;
  let service: CreateVchWizardService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpModule,
        HttpClientModule,
        ReactiveFormsModule,
        ClarityModule,
        BrowserAnimationsModule
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
            isPluginMode: () => {
              return true;
            }
          }
        },
        {
          provide: CreateVchWizardService, useValue: {
            checkVchNameUniqueness: (name) => {
              // TODO: check if this makes sense
              return Observable.of(name === 'unique');
            },
            getVicApplianceIp: (): Observable<string> => {
              return Observable.of('10.20.250.255');
            },
            getCloneTicket: () => Observable.of(''),
            getClustersList: () => Observable.of([]),
            getDatastores: () => Observable.of([])
          }
        },
        {
          provide: RefreshService, useValue: {
            refresh: () => {}
          }
        },
        ConfigureVchService
      ],
      declarations: [
        CreateVchWizardComponent,
        VchGeneralComponent,
        VchComputeComponent,
        VchStorageComponent,
        ComputeResourceTreenodeComponent,
        VchNetworkComponent,
        VchSecurityComponent,
        VchRegistryComponent,
        VchOperationsComponent,
        SummaryComponent,
        CapitalizePipe,
        CliCommandComponent
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

  it('should be created', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should have called wizard.open', async(() => {
    expect(component.resizeToParentFrame).toHaveBeenCalled();
  }));

});
