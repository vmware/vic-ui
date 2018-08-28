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

import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Http, HttpModule, XSRFStrategy } from '@angular/http';
import { ClarityModule } from '@clr/angular';

import {
  Globals,
  GlobalsService,
  I18nService,
  Vic18nService,
  RefreshService,
  AppAlertComponent,
  AppAlertService
} from './shared/index';
import { ActionDevService } from './services/action-dev.service';
import { AppErrorHandler } from './shared/appErrorHandler';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { DisableCookieXSRFStrategy } from './shared/utils/disable-cookie-xsrf-strategy';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { HttpClientModule } from '@angular/common/http';
import { VicVmViewService } from './services/vm-view.service';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    ClarityModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AppAlertComponent,
    routedComponents
  ],
  providers: [
    VicVmViewService,
    ActionDevService,
    AppAlertService,
    AppErrorHandler,
    Globals,
    { provide: XSRFStrategy, useClass: DisableCookieXSRFStrategy },
    GlobalsService,
    I18nService,
    Vic18nService,
    RefreshService,
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: Http, useClass: HttpInterceptorService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
