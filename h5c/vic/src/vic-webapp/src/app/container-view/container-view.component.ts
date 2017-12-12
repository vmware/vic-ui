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

import { Comparator, State } from 'clarity-angular';
import {
    Component,
    NgZone,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    GlobalsService,
    RefreshService,
    Vic18nService
} from '../shared';
import {
    VM_COMMITTEDSTORAGE,
    VM_GUESTMEMORYUSAGE,
    VM_OVERALLCPUUSAGE,
    VSPHERE_SERVEROBJ_VIEWEXT_KEY,
    VSPHERE_VITREE_HOSTCLUSTERVIEW_KEY,
    VSPHERE_VM_SUMMARY_KEY,
    WS_CONTAINER
} from '../shared/constants';

import { ContainerVm } from './container.model';
import { CreateVchWizardService } from '../create-vch-wizard/create-vch-wizard.service';
import { Subscription } from 'rxjs/Subscription';
import { VicVmViewService } from '../services/vm-view.service';

class GuestMemoryUsageComparator implements Comparator<any> {
    compare(a: any, b: any) {
        return a[VM_GUESTMEMORYUSAGE] - b[VM_GUESTMEMORYUSAGE];
    }

    toString(): string {
        return VM_GUESTMEMORYUSAGE;
    }
}

class OverallCpuUsageComparator implements Comparator<any> {
    compare(a: any, b: any) {
        return a[VM_OVERALLCPUUSAGE] - b[VM_OVERALLCPUUSAGE];
    }

    toString(): string {
        return VM_OVERALLCPUUSAGE;
    }
}

class CommittedStorageComparator implements Comparator<any> {
    compare(a: any, b: any) {
        return a[VM_COMMITTEDSTORAGE] - b[VM_COMMITTEDSTORAGE];
    }

    toString(): string {
        return VM_COMMITTEDSTORAGE;
    }
}

@Component({
    selector: 'vic-container-view',
    styleUrls: [],
    templateUrl: './container-view.template.html'
})
export class VicContainerViewComponent implements OnInit, OnDestroy {
    public readonly WS_CONTAINER_CONSTANTS = WS_CONTAINER;
    private refreshSubscription: Subscription;
    public guestMemoryUsageComparator = new GuestMemoryUsageComparator();
    public overallCpuUsageComparator = new OverallCpuUsageComparator();
    public committedStorageComparator = new CommittedStorageComparator();
    public isDgLoading = true;
    public containers: ContainerVm[] = [];
    public totalContainersCount = 0;
    public currentState: {
        offset: number;
        sorting: string;
        filter: string;
    } = { offset: 0, sorting: 'id,asc', filter: '' };
    public errorObj: {type: string; payload: any};
    public readonly maxResultCount: number = 10;
    public readonly MEGABYTE: number = Math.pow(1024, 2);
    public readonly GIGABYTE: number = Math.pow(1024, 3);

    constructor(
        private zone: NgZone,
        private vmViewService: VicVmViewService,
        private refreshService: RefreshService,
        private globalsService: GlobalsService,
        public vicI18n: Vic18nService,
        private createWzService: CreateVchWizardService
    ) { }

    ngOnInit() {
        // subscribes to the global refresh event and calls the
        // reloadContainers() method to query the server for new data
        this.refreshSubscription = this.refreshService
            .refreshObservable$.subscribe(() => {
                this.zone.run(() => {
                    this.reloadContainers();
                });
            });

        // listens to an observable that gets the updated containers data
        // from the server, and updates this.containers
        this.vmViewService.containers$.subscribe(vms => {
            this.containers = vms;
            this.isDgLoading = false;
            this.totalContainersCount = this.vmViewService.totalContainersCount;
        }, err => {
            this.containers = [];
        });

        // verify the appliance endpoint
        this.checkVicMachineServer();
    }

    checkVicMachineServer() {
      this.createWzService.verifyVicMachineApiEndpoint()
        .subscribe(
          (ip: string) => {
            this.errorObj = null;
          },
          (err: {type: string; payload: any}) => {
            this.errorObj = err;
          }
        );
    }

    ngOnDestroy() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    /**
     * Queries vic-service with the current Datagrid state
     * @param state current Datagrid state
     */
    refreshGrid(state: State) {
        this.currentState.filter = state.filters ? state.filters
            .map(item => item['property'] + '=' + item['value'])
            .join(',') : '';

        if (state.sort) {
            const sortBy = typeof state.sort.by === 'object' ?
                state.sort.by.toString() : state.sort.by;

            this.currentState.sorting =
                `${sortBy},${state.sort.reverse ? 'desc' : 'asc'}`;
        }

        this.currentState.offset = state.page.from;
        this.reloadContainers();
    }

    /**
     * Calls vm-view service to reload Containers
     */
    reloadContainers() {
        this.isDgLoading = true;
        this.vmViewService.getContainersData({
            sorting: this.currentState.sorting,
            filter: this.currentState.filter,
            offset: this.currentState.offset,
            maxResultCount: this.maxResultCount
        });
    }

    /**
     * Navigates to an object specified by objectId
     * @param objectId Full vSphere objectId which starts with urn:
     */
    navigateToObject(objectId: string) {
        if (objectId.indexOf('VirtualMachine') > -1) {
            this.globalsService.getWebPlatform().sendNavigationRequest(
                VSPHERE_VM_SUMMARY_KEY, objectId);
        } else {
            window.parent.location.href = '/ui/#?extensionId=' +
                VSPHERE_SERVEROBJ_VIEWEXT_KEY + '&' +
                'objectId=' + objectId + '&' +
                'navigator=' + VSPHERE_VITREE_HOSTCLUSTERVIEW_KEY;
        }
    }

    /**
     * Turns size in byte into a more legible unit
     * @param size
     * @return pretty-formatted size
     */
    formatStorage(size: number): string {
        let results: string;
        if (size < this.MEGABYTE) {
            results = Math.round(size / 1024) + ' KB';
        } else if (size < this.GIGABYTE) {
            results = Math.round(size / this.MEGABYTE) + ' MB';
        } else {
            results = Math.round(size / this.GIGABYTE) + ' GB';
        }
        return results;
    }
}
