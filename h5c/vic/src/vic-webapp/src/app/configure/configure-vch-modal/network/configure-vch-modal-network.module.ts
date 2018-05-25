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
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ClarityModule} from '@clr/angular';
import {ConfigureVchService} from '../../configure-vch.service';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {SharedModule} from '../../../shared/shared.module';
import {ConfigureVchModalContainerModule} from '../configure-vch-modal-container.module';
import {ConfigureVchModalNetworkComponent} from './configure-vch-modal-network.component';

const routes: Routes = [
  {path: '**', component: ConfigureVchModalNetworkComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ClarityModule,
    RouterModule.forChild(routes),
    SharedModule,
    ConfigureVchModalContainerModule
  ],
  declarations: [
    ConfigureVchModalNetworkComponent
  ],
  exports: [
    ConfigureVchModalNetworkComponent
  ],
  providers: [
    ConfigureVchService,
    CreateVchWizardService
  ],
})
export class ConfigureVchModalNetworkModule {
}
