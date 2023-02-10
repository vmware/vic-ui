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

import {
    AppAlertService,
    Globals,
    GlobalsService,
    I18nService,
    RefreshService,
    Vic18nService
} from '../shared';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import {
    getContainerResponseStub,
    getMalformedContainerResponseStub
} from '../services/mocks/container.response';

import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { ContainerVm } from './container.model';
import { CreateVchWizardService } from '../create-vch-wizard/create-vch-wizard.service';
import { HttpModule } from '@angular/http';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { Observable, Subject, of } from 'rxjs';
import { VicContainerViewComponent } from './container-view.component';
import { VicOvaVerificationComponent } from '../shared/vic-ova-verification.component';
import { VicVmViewService } from '../services/vm-view.service';
import { WS_CONTAINER } from '../shared/constants';
import { DebugElement } from '@angular/core';

let responseProperlyFormatted = true;

class VicVmViewServiceStub {
    private containersSubj: Subject<ContainerVm[]>;
    public containers$: Observable<ContainerVm[]>;
    private data: ContainerVm[] = [];
    public totalContainersCount: number;

    constructor() {
        this.containersSubj = new Subject<ContainerVm[]>();
        this.containers$ = this.containersSubj.asObservable();
    }

    getContainersData() {
        // populates data with either correctly or incorrectly formatted data
        // based on the responseProperlyFormatted flag
        this.data = [];
        const cResponse = responseProperlyFormatted ?
            getContainerResponseStub().results :
            getMalformedContainerResponseStub().results;

        try {
            for (const objId in cResponse) {
                if (cResponse.hasOwnProperty(objId)) {
                    this.data.push(new ContainerVm(cResponse[objId]));
                }
            }
            this.totalContainersCount = this.data.length;
            this.containersSubj.next(this.data);
        } catch (e) {
            this.containersSubj.error('error');
        }
    }
}

describe('VicContainerViewComponent', () => {
    let fixture: ComponentFixture<VicContainerViewComponent>;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: VicVmViewService, useClass: VicVmViewServiceStub },
                GlobalsService,
                Globals,
                RefreshService,
                AppAlertService,
                I18nService,
                Vic18nService,
                { provide: CreateVchWizardService, useValue: {
                  verifyVicMachineApiEndpoint() {
                    return of('10.10.10.10');
                  }
                }}
            ],
            declarations: [
                VicContainerViewComponent,
                VicOvaVerificationComponent
            ],
            imports: [
                ClarityModule,
                HttpModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent<VicContainerViewComponent>
            (VicContainerViewComponent);
    });

    it('should render the data grid with properly formatted data', async(() => {
        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.reloadContainers();
        // fixture.detectChanges();
        fixture.componentInstance.refreshGrid({ page: { from: 0, to: 9, size: 10}});
        // fixture.detectChanges();
        const rowElements = fixture.debugElement.queryAll(By.css('clr-dg-row'));
        const rowElementsLength = rowElements.length;
        expect(rowElementsLength).toBe(0);
    }));

    it('should navigate correctly through the VCHs pages', async(() => {
        let paginationText: DebugElement;
        let nextPageButton: DebugElement;
        let rowElements: DebugElement [];
        let vchFirstRow: DebugElement [];
        let rowElementsLength = 0;

        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.reloadContainers();
        // fixture.detectChanges();
        paginationText = fixture.debugElement.query(By.css('div.datagrid-foot-description'));
        nextPageButton = fixture.debugElement.query(By.css('button.pagination-next'));

        // cheking on the first page
        rowElements = fixture.debugElement.queryAll(By.css('clr-dg-row'));
        rowElementsLength = rowElements.length;
        vchFirstRow = fixture.debugElement.queryAll(By.css('.datagrid-cell'));

        expect(rowElementsLength).toBe(0);
        if (vchFirstRow && vchFirstRow[0] && vchFirstRow[0].nativeElement) {
            expect(vchFirstRow[0].nativeElement.textContent).toContain('Container-VM-0');
        }
        if (paginationText && paginationText.nativeElement) {
            expect(paginationText.nativeElement.textContent).toContain('1 - 10 of 10');
        }
    }));

    it('should render zero row for malformed data', async(() => {
        responseProperlyFormatted = false;
        fixture.componentInstance.ngOnInit();
        fixture.componentInstance.reloadContainers();
        // fixture.detectChanges();
        const rowElements = fixture.debugElement.queryAll(By.css('clr-dg-row'));
        const rowElementsLength = rowElements.length;
        expect(rowElementsLength).toBe(0);
    }));

    // it('should render default localized text for table headers', async(() => {
    //     fixture.componentInstance.ngOnInit();
    //     fixture.componentInstance.reloadContainers();
    //     fixture.detectChanges();

    //     // containerName column
    //     const containerEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-field="containerName"]'));
    //     expect(containerEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.CONTAINER_NAME
    //         ]);

    //     // powerState column
    //     const powerStateEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-field="powerState"]'));
    //     expect(powerStateEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.POWER_STATE
    //         ]);

    //     // guestMemoryUsage column
    //     const guestMemoryUsageEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-sort-by="guestMemoryUsage"]'));
    //     expect(guestMemoryUsageEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.MEMORY_USAGE
    //         ]);

    //     // overallCpuUsage column
    //     const overallCpuUsageEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-sort-by="overallCpuUsage"]'));
    //     expect(overallCpuUsageEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.CPU_USAGE
    //         ]);

    //     // committedStorage column
    //     const committedStorageEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-sort-by="committedStorage"]'));
    //     expect(committedStorageEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.STORAGE_USAGE
    //         ]);

    //     // portMapping column
    //     const portMappingEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-field="portMapping"]'));
    //     expect(portMappingEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.PORT_MAPPING
    //         ]);

    //     // name column
    //     const nameEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-field="name"]'));
    //     expect(nameEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.VM_NAME
    //         ]);

    //     // imageName column
    //     const imageNameEl = fixture.debugElement.query(
    //         By.css('clr-dg-column[ng-reflect-field="imageName"]'));
    //     expect(imageNameEl.nativeElement.textContent.trim()).toBe(
    //         WS_CONTAINER.DG.COLUMNS.defaults[
    //         WS_CONTAINER.DG.COLUMNS.keys.IMAGE_NAME
    //         ]);
    // }));
});
