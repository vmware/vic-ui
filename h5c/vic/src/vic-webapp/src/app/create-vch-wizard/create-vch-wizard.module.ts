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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { CreateVchWizardComponent } from './create-vch-wizard.component';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { NgModule } from '@angular/core';
import { OperationsUserComponent } from './operations-user/operations-user.component';
import { SecurityComponent } from './security/security.component';
import { SummaryComponent } from './summary/summary.component';
import { RegistryAccessComponent } from './registry-access/registry-access.component';
import { SharedModule } from '../shared/shared.module';
import {ConfigureVchService} from '../configure/configure-vch.service';

const routes: Routes = [
  { path: '', component: CreateVchWizardComponent },
  { path: ':id', component: CreateVchWizardComponent }
];

const declarations = [
  CreateVchWizardComponent,
  SecurityComponent,
  RegistryAccessComponent,
  OperationsUserComponent,
  SummaryComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClarityModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    ...declarations,
  ],
  providers: [
    CreateVchWizardService,
    ConfigureVchService
  ],
  exports: [
    ...declarations
  ]
})
export class CreateVchWizardModule { }
