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

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { APP_CONFIG } from './shared/index';
import { AppRoutingComponent } from './app-routing.component';

const appRoutes: Routes = [
    { path: 'index.html', component: AppRoutingComponent },
    { path: 'portlet', loadChildren: () => import('./summary-portlet/summary-portlet.module').then(mod => mod.VicSummaryPortletModule) },
    { path: 'summary-view', loadChildren: () => import('./summary-view/summary-view.module').then(mod => mod.VicSummaryViewModule) },
    { path: 'vch-view', loadChildren: () => import('./vch-view/vch-view.module').then(mod => mod.VicVchViewModule) },
    { path: 'container-view', loadChildren: () => import('./container-view/container-view.module').then(mod => mod.VicContainerViewModule) },
    { path: 'create-vch', loadChildren: () => import('./create-vch-wizard/create-vch-wizard.module').then(mod => mod.CreateVchWizardModule) },
    { path: 'delete-vch', loadChildren: () => import('./delete-vch-modal/delete-vch-modal.module').then(mod => mod.DeleteVchModalModule) },
    { path: 'ui-actions', loadChildren: () => import('./ui-actions/ui-actions.module').then(mod => mod.UiActionsModule) }
];

export const extensionToRoutes = {};
extensionToRoutes[APP_CONFIG.packageName + '.objectView.summaryView'] = '/objectViewSummary';
extensionToRoutes[APP_CONFIG.packageName + '.objectView.monitorView'] = '/objectViewMonitor';
extensionToRoutes[APP_CONFIG.packageName + '.objectView.vchView'] = '/objectViewVch';
extensionToRoutes[APP_CONFIG.packageName + '.objectView.containerView'] = '/objectViewContainer';

export const routedComponents = [AppRoutingComponent];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
