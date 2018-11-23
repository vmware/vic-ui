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

import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { GlobalsService, RefreshService } from '../shared/index';
import {
    VIC_LOGO_100X100,
    WS_SUMMARY
} from '../shared/constants/index';

import { CreateVchWizardService } from '../create-vch-wizard/create-vch-wizard.service';
import { DataPropertyService } from '../services/data-property.service';
import { Observable } from 'rxjs';
import { Subscription, Subject} from 'rxjs';
import { Vic18nService } from '../shared/vic-i18n.service';

@Component({
    selector: 'vic-summary-view',
    styleUrls: ['vic-summary-view.scss'],
    templateUrl: './summary-view.component.html'
})

export class VicSummaryViewComponent implements OnInit, OnDestroy {
    public vicLogoPath: string;
    public pluginVersion: string;
    public vchVmsLen: number;
    public appliance = new Subject<string []>();
    public readonly WS_SUMMARY_CONSTANTS = WS_SUMMARY;
    private rootInfoSubscription: Subscription;
    private refreshSubscription: Subscription;
    public error: any;
    public applianceIp: string;
    public applianceVersion: string;

    constructor(
        private zone: NgZone,
        private globalsService: GlobalsService,
        public vicI18n: Vic18nService,
        private refreshService: RefreshService,
        private dataPropertyService: DataPropertyService,
        private createWzService: CreateVchWizardService
    ) {
        this.vicLogoPath = this.isPluginMode() ?
            this.globalsService.getWebContextPath() + VIC_LOGO_100X100 :
            VIC_LOGO_100X100;

        this.rootInfoSubscription = this.dataPropertyService
            .vicObject$.subscribe(res => {
                this.pluginVersion = res.uiVersion;
                this.vchVmsLen = res.vchVmsLen;
            }, err => {
                console.error(err);
            });

        this.refreshSubscription = this.refreshService
            .refreshObservable$.subscribe(() => {
                this.zone.run(() => {
                    this.fetchRootInfo();
                });
            });
    }

    /**
     * Evaluates if the application is running in the vSphere Client environment,
     * which is called the "Plugin Mode"
     * @returns true if plugin mode. false if not
     */
    isPluginMode() {
        return this.globalsService.isPluginMode();
    }

    fetchRootInfo(): void {
        this.dataPropertyService.fetchRootInfo(
            ['vchVmsLen', 'containerVmsLen', 'uiVersion']
        );
    }

    ngOnInit() {
        this.fetchRootInfo();
        // verify the appliance endpoint
        this.getApplianceInfo();
        this.checkVicMachineServer();
    }

    getApplianceInfo() {
        this.createWzService.getAppliance()
        .subscribe(
            (response) => {
              if (response.length > 0) {
                const splitByColon = response[0].split(':');
                this.applianceVersion = splitByColon[0];
                this.applianceIp = splitByColon[1].split(',')[1].trim();
              }
            }
        )
    }

    checkVicMachineServer() {
      this.createWzService.verifyVicMachineApiEndpoint()
      .subscribe(
        (ip: string) => {
          this.error = null;
        },
        (err: {type: string; payload: any}) => {
          this.error = err;
        });
    }

    ngOnDestroy() {
        if (this.rootInfoSubscription) {
            this.rootInfoSubscription.unsubscribe();
        }

        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }
}
