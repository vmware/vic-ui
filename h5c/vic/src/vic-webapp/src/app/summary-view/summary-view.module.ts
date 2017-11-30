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
import { RouterModule, Routes } from '@angular/router';

import { ClarityModule } from 'clarity-angular';
import { CommonModule } from '@angular/common';
import { CreateVchWizardService } from '../create-vch-wizard/create-vch-wizard.service';
import { DataPropertyService } from '../services/data-property.service';
import { NgModule } from '@angular/core';
import { VicOvaVerificationComponent } from '../shared/vic-ova-verification.component';
import { VicSummaryViewComponent } from './summary-view.component';

const routes: Routes = [
    { path: '', component: VicSummaryViewComponent },
    { path: ':id', component: VicSummaryViewComponent }
];

@NgModule({
    imports: [
        CommonModule,
        ClarityModule.forChild(),
        RouterModule.forChild(routes)
    ],
    declarations: [
      VicSummaryViewComponent,
      VicOvaVerificationComponent
    ],
    providers: [
      DataPropertyService,
      CreateVchWizardService
    ],
    exports: [VicSummaryViewComponent]
})
export class VicSummaryViewModule { }
