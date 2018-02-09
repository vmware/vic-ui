/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { AppComponent } from './app.component';
import { ApplianceInitComponent } from './applianceInit/applianceInit.component';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { LocalStorageService } from './services/localstorage.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApplianceService } from './services/appliance.service';
import { HttpClientModule } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import { appConfigToken } from './config/app.config';
import { GettingStartedComponent } from './main-view/getting-started/getting-started.component';
import { ConfigureComponent } from './main-view/configure/configure.component';

@NgModule({
  declarations: [
    AppComponent,
    ApplianceInitComponent,
    GettingStartedComponent,
    ConfigureComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClarityModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    AuthGuardService,
    LocalStorageService,
    ApplianceService,
    {
      provide: appConfigToken,
      useValue: {
        baseApiUrl: 'api'
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
