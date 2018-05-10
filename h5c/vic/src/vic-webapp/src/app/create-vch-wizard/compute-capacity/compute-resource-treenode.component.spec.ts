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
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {HttpModule} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {ReactiveFormsModule} from '@angular/forms';
import {Globals, GlobalsService} from '../../shared';
import {ServerInfo} from '../../shared/vSphereClientSdkTypes';
import {ComputeResourceTreenodeComponent} from '../../shared/components/vch-compute/compute-resource-treenode.component';

describe('ComputeResourceTreenodeComponent', () => {

  let component: ComputeResourceTreenodeComponent;
  let fixture: ComponentFixture<ComputeResourceTreenodeComponent>;
  let service: CreateVchWizardService;

  const datacenter = {
    text: 'Datacenter',
    spriteCssClass: 'vsphere-icon-datacenter',
    hasChildren: true,
    objRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'Datacenter',
    isEmpty: null,
    aliases: [
      'urn:vmomi:Folder:group-h4:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-v3:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-s5:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-n6:d7c361cc-0a46-441e-8e21-ac22debf7003'
    ]
  };
  const datacenter1 = {
    text: 'Datacenter 1',
    spriteCssClass: 'vsphere-icon-datacenter',
    hasChildren: true,
    objRef: 'urn:vmomi:Datacenter:datacenter-52:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'Datacenter',
    isEmpty: null,
    aliases: [
      'urn:vmomi:Folder:group-h54:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-v53:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-s55:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-n56:d7c361cc-0a46-441e-8e21-ac22debf7003'
    ]
  };
  const serverInfoServiceGui = ' d7c361cc-0a46-441e-8e21-ac22debf7003';
  const mockedClustersList = [
    {
      text: 'New Cluster',
      spriteCssClass: 'vsphere-icon-cluster',
      hasChildren: true,
      objRef: 'urn:vmomi:ClusterComputeResource:domain-c23:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'DcCluster',
      aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
      datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
    },
    {
      text: '10.192.109.234',
      spriteCssClass: 'vsphere-icon-host-warning',
      hasChildren: true,
      objRef: 'urn:vmomi:HostSystem:host-94:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'DcStandaloneHost',
      aliases: ['urn:vmomi:ResourcePool:resgroup-93:d7c361cc-0a46-441e-8e21-ac22debf7003'],
      datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
    },
    {
      text: 'New Cluster 1',
      spriteCssClass: 'vsphere-icon-cluster',
      hasChildren: true,
      objRef: 'urn:vmomi:ClusterComputeResource:domain-c98:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'DcCluster',
      aliases: ['urn:vmomi:ResourcePool:resgroup-99:d7c361cc-0a46-441e-8e21-ac22debf7003'],
      datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-52:d7c361cc-0a46-441e-8e21-ac22debf7003'
    }
  ];
  const cluster1HostSystems = [
    {
      text: '10.161.251.202',
      spriteCssClass: 'vsphere-icon-host-warning',
      hasChildren: false,
      objRef: 'urn:vmomi:HostSystem:host-20:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'ClusterHostSystem',
      aliases: null
    },
    {
      text: '10.162.17.176',
      spriteCssClass: 'vsphere-icon-host-warning',
      hasChildren: false,
      objRef: 'urn:vmomi:HostSystem:host-9:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'ClusterHostSystem',
      aliases: null
    }
  ];
  const cluster2HostSystems = [
    {
      text: '10.192.115.9',
      spriteCssClass: 'vsphere-icon-host-warning',
      hasChildren: false,
      objRef: 'urn:vmomi:HostSystem:host-101:d7c361cc-0a46-441e-8e21-ac22debf7003',
      nodeTypeId: 'ClusterHostSystem',
      aliases: null
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      providers: [
        CreateVchWizardService,
        Globals,
        GlobalsService,
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

  it('should retrieve hosts and clusters filtered by datacenter1', () => {
    component.datacenter = datacenter1;
    spyOn(service, 'getClustersList').and.returnValue(Observable.of(mockedClustersList));
    spyOn(service, 'getAllClusterHostSystems').and.returnValue(Observable.of(cluster2HostSystems));
    component.loadClusters(<ServerInfo>{serviceGuid: serverInfoServiceGui});

    expect(component.clusters.length).toBe(1);
    expect(component.clusters[0].objRef).toBe(mockedClustersList[2].objRef);
    expect(component.standaloneHosts.length).toBe(0);

  });

  it('should retrieve hosts and clusters filtered by datacenter2', () => {
    component.datacenter = datacenter;
    spyOn(service, 'getClustersList').and.returnValue(Observable.of(mockedClustersList));
    spyOn(service, 'getAllClusterHostSystems').and.returnValue(Observable.of(cluster1HostSystems));
    component.loadClusters(<ServerInfo>{serviceGuid: serverInfoServiceGui});

    expect(component.clusters.length).toBe(1);
    expect(component.clusters[0].objRef).toBe(mockedClustersList[0].objRef);
    expect(component.standaloneHosts.length).toBe(1);

  });

});
