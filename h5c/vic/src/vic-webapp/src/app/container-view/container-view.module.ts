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
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { CreateVchWizardService } from '../create-vch-wizard/create-vch-wizard.service';
import { SharedModule } from '../shared/shared.module';
import { VicContainerViewComponent } from './container-view.component';
import { VicVmViewService } from '../services/vm-view.service';

const routes: Routes = [
    { path: '', component: VicContainerViewComponent },
    { path: ':id', component: VicContainerViewComponent }
];

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        CommonModule,
        ClarityModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [
      VicContainerViewComponent
    ],
    providers: [
        VicVmViewService,
        CreateVchWizardService
    ],
    exports: [VicContainerViewComponent]
})
export class VicContainerViewModule { }
