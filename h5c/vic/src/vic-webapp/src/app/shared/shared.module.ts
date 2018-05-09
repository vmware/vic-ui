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

import { ClarityModule } from '@clr/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { VicOvaVerificationComponent } from './vic-ova-verification.component';
import {VchGeneralComponent} from './components/vch-general/vch-general.component';
import {CliCommandComponent} from './components/cli-command/cli-command.component';
import {VchComputeComponent} from './components/vch-compute/vch-compute.component';
import {CapitalizePipe} from './pipes/capitalize.pipe';
import {ComputeResourceTreenodeComponent} from './components/vch-compute/compute-resource-treenode.component';

const declarations = [
  VicOvaVerificationComponent,
  VchGeneralComponent,
  VchComputeComponent,
  ComputeResourceTreenodeComponent,
  CliCommandComponent,
  CapitalizePipe
];

@NgModule({
  imports: [
    CommonModule,
    ClarityModule.forChild(),
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ...declarations
  ],
  providers: [],
  exports: [
    ...declarations
  ]
})
export class SharedModule {}
