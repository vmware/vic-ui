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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ClarityModule} from '@clr/angular';
import {ComputeResourceTreenodeComponent} from './compute-resource-treenode.component';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {HttpModule} from '@angular/http';
import {Observable, of} from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';
import {Globals, GlobalsService} from '../../shared';
import {HttpClientModule} from '@angular/common/http';
import {VicVmViewService} from '../../services/vm-view.service';
import {
  mockedClusterHostsList1,
  mockedClusterHostsList2,
  datacenter,
  datacenter1,
  mockedDcClustersAndStandAloneHostsList,
  vicResourcePoolList
} from '../mocks/create-vch-wizard-mocked-data';

describe('ComputeResourceTreenodeComponent', () => {

  let component: ComputeResourceTreenodeComponent;
  let fixture: ComponentFixture<ComputeResourceTreenodeComponent>;
  let service: CreateVchWizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        HttpClientModule,
        ClarityModule
      ],
      providers: [
        CreateVchWizardService,
        Globals,
        GlobalsService,
        VicVmViewService
      ],
      declarations: [
        ComputeResourceTreenodeComponent
      ]
    });
    fixture = TestBed.createComponent(ComputeResourceTreenodeComponent);
    component = fixture.componentInstance;
    service = fixture.debugElement.injector.get(CreateVchWizardService);

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve a ComputeResource list filtered by type', () => {
    component.datacenter = datacenter1;
    spyOn(service, 'getVicResourcePoolList').and.returnValue(of(vicResourcePoolList));
    spyOn(service, 'getDcClustersAndStandAloneHosts').and.returnValue(of(mockedDcClustersAndStandAloneHostsList));
    spyOn(service, 'getHostsAndResourcePoolsFromClusters').and.returnValue(of(mockedClusterHostsList2));
    component.loadClustersAndStandAloneHosts();

    expect(component.clusters.length).toBe(2);
    expect(component.clusters[0].objRef).toBe(mockedDcClustersAndStandAloneHostsList[0].objRef);
    expect(component.standaloneHosts.length).toBe(1);
  });

  it('should retrieve a list of hosts belonging to a particular Cluster', () => {
    component.datacenter = datacenter;
    spyOn(service, 'getVicResourcePoolList').and.returnValue(of(vicResourcePoolList));
    spyOn(service, 'getDcClustersAndStandAloneHosts').and.returnValue(of(mockedDcClustersAndStandAloneHostsList));
    spyOn(service, 'getHostsAndResourcePoolsFromClusters').and.returnValue(of(mockedClusterHostsList1));
    component.loadClustersAndStandAloneHosts();

    expect(component.clusterHostSystemsMap[mockedDcClustersAndStandAloneHostsList[0].objRef].length)
      .toBe(mockedClusterHostsList1.length);
    expect(component.clusterHostSystemsMap[mockedDcClustersAndStandAloneHostsList[0].objRef][0].objRef)
      .toBe(mockedClusterHostsList1[0].objRef);
  });

});
