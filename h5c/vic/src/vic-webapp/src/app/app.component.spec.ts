/* tslint:disable:no-unused-variable */
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

import {
    AppAlertComponent,
    AppAlertService,
    Globals,
    GlobalsService,
    I18nService,
    RefreshService
} from './shared/index';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { ActionDevService } from './services/action-dev.service';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { ContainerPortletComponent } from './summary-portlet/container-portlet/container-portlet.component';
import { HttpModule } from '@angular/http';
import { JASMINE_TIMEOUT } from './testing/jasmine.constants';
import { RouterModule } from '@angular/router';
import { VchPortletComponent } from './summary-portlet/vch-portlet/vch-portlet.component';
import { VicOvaVerificationComponent } from './shared/vic-ova-verification.component';
import { VicSummaryViewComponent } from './summary-view/summary-view.component';

describe('VIC UI Unit Tests', () => {
  let fixture: ComponentFixture<AppComponent>;
  let appInstance: AppComponent;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [
          AppComponent,
          VchPortletComponent,
          ContainerPortletComponent,
          VicSummaryViewComponent,
          VicOvaVerificationComponent,
          routedComponents,
          AppAlertComponent
        ],
        providers: [
          { provide: APP_BASE_HREF, useValue: '/'},
          AppAlertService,
          Globals,
          GlobalsService,
          I18nService,
          RefreshService
        ],
        imports: [
          AppRoutingModule,
          ClarityModule,
          HttpModule
        ]
      })
      .compileComponents();
    }));

    beforeEach(async() => {
      fixture = TestBed.createComponent<AppComponent>(AppComponent);
      appInstance = fixture.componentInstance;
    });

    it('should create the main app successfully', async() => {
      expect(appInstance).toBeTruthy();
    });
});
