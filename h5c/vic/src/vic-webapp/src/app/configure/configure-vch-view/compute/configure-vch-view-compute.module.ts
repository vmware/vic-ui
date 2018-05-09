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
import {ConfigureVchViewComputeComponent} from './configure-vch-view-compute.component';
import {ConfigureVchService} from '../../configure-vch.service';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {ConfigureVchViewContainerModule} from '../configure-vch-view-container.module';

const routes: Routes = [
  {path: '', component: ConfigureVchViewComputeComponent},
  {path: ':id', component: ConfigureVchViewComputeComponent}
];

const declarations = [
  ConfigureVchViewComputeComponent
];

@NgModule({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ClarityModule,
    SharedModule,
    RouterModule.forChild(routes),
    ConfigureVchViewContainerModule
  ],
  declarations: [
    ...declarations
  ],
  exports: [
    ...declarations
  ],
  providers: [
    ConfigureVchService,
    CreateVchWizardService
  ]
})
export class ConfigureVchViewComputeModule {
}
