import { fakeAsync, tick } from '@angular/core/testing';
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
import { TestBed, async } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import {
  BaseRequestOptions,
  ConnectionBackend,
  RequestOptions,
  Http,
  Response,
  ResponseOptions,
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { Globals, GlobalsService } from '../shared';
import {
  folderDSwitchList,
  netWorkingResources,
  folderDSwitchPorGroupsList,
  hostResourceBasicInfos,
  dcDSwitchPorGroupsList,
  dvsHostsEntriesList,
  hostComputeResources,
  clusterComputeResources,
  clusterResourceBasicInfos,
  dcComputeResources,
  rpResourceBasicInfos,
  rpComputeResources
} from './mocks/create-vch-wizard-mocked-data';
import { ComputeResource } from '../interfaces/compute.resource';
import { COMPUTE_RESOURCE_NODE_TYPES } from '../shared/constants';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { VicVmViewService } from '../services/vm-view.service';
import { getMorIdFromObjRef, resourceIsCluster, resourceIsHost, resourceIsResourcePool } from '../shared/utils/object-reference';

const clusterHostsChilds = of([hostResourceBasicInfos[4]]);
const observableFolderDSwitchPorGroupsList = [
  of([
    folderDSwitchPorGroupsList[0],
    folderDSwitchPorGroupsList[1],
    folderDSwitchPorGroupsList[2]
  ]),
  of([
    folderDSwitchPorGroupsList[3],
    folderDSwitchPorGroupsList[4],
    folderDSwitchPorGroupsList[5]
  ])
];
const observableDcDSwitchPorGroupsList = [
  of([
    dcDSwitchPorGroupsList[0],
    dcDSwitchPorGroupsList[1]
  ]),
  of([
    dcDSwitchPorGroupsList[2],
    dcDSwitchPorGroupsList[3],
    dcDSwitchPorGroupsList[4]
  ])
];
const ObservableDvsHostsEntriesList = [
  of([
    dvsHostsEntriesList[0]
  ]),
  of([
    dvsHostsEntriesList[1],
    dvsHostsEntriesList[2]
  ]),
  of([
    dvsHostsEntriesList[3]
  ]),
  of([
    dvsHostsEntriesList[4]
  ])
];
const ObservableFolderDSwitchList = of(folderDSwitchList);
const ObservableNetWorkingResources = of(netWorkingResources);

const resourceCompleteInfoProps = 'name,parent,resourcePool';
const clustersAndStandaloneHostsProps = 'host,cluster';
const hostsProps = 'host';
const resourcePoolProps = 'resourcePool';
function getResourcePropertiesResponse(objRef: string, requestedProps: string) {
  let responseObject: any;
  const resourcesSource = hostComputeResources
    .concat(clusterComputeResources)
    .concat(rpComputeResources);
  switch (requestedProps) {
    case resourceCompleteInfoProps:
      const objValue = getMorIdFromObjRef(objRef);
      const completeResourceInfo = resourcesSource.find(resource => resource.value === objValue);
      responseObject = {
        name: completeResourceInfo.name,
        parent: completeResourceInfo.parent,
        resourcePool: completeResourceInfo.resourcePool
      };
      break;
    case clustersAndStandaloneHostsProps:
      responseObject = {
        host: hostResourceBasicInfos,
        cluster: clusterResourceBasicInfos,
      };
      break;
    case hostsProps:
      const childHosts = hostComputeResources
        .filter(host => host.parent && host.parent.value === getMorIdFromObjRef(objRef))
        .map(hostResource => hostResourceBasicInfos.find(basicHost => basicHost.value === hostResource.value));
      responseObject = {
        host: childHosts
      };
      break;
    case resourcePoolProps:
      responseObject = {
        resourcePool: rpResourceBasicInfos
      };
      break;
  }
  return of(responseObject);
}

describe('CreateVchWizardService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
    let service: CreateVchWizardService;
    let connection: MockConnection;
    let backend: MockBackend;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
              HttpClientModule,
            ],
            providers: [
                CreateVchWizardService,
                Http,
                { provide: ConnectionBackend, useClass: MockBackend },
                { provide: RequestOptions, useClass: BaseRequestOptions },
                Globals,
                GlobalsService,
                HttpClient,
                VicVmViewService
            ]
        }).compileComponents();
        service = TestBed.get(CreateVchWizardService);
        backend = TestBed.get(ConnectionBackend);
        backend.connections.subscribe((c: MockConnection) => connection = c);
    }));

    it('should exist', () => {
        expect(service).toBeTruthy();
    });

    it('should return Observable of true', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => {
                expect(value).toBe(true);
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: true
        })));
    }));

    it('should return Observable of false', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => {
                expect(value).toBe(false);
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: false
        })));
    }));

    it('should catch http error', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => { }, (err: Error) => {
                expect(err.message).toEqual('some http error');
            });
        connection.mockError(new Error('some http error'));
    }));

    it('should catch json parse error', async(() => {
        service.checkVchNameUniqueness('lorem')
            .subscribe(value => { }, (err: Error) => {
                expect(err instanceof SyntaxError).toBeTruthy();
            });
        connection.mockRespond(new Response(new ResponseOptions({
            body: 'uhoh'
        })));
    }));

    it('should get IP address of the latest VIC appliance', async() => {
      service.getVicApplianceIp().subscribe(response => {
        expect(response).toBe('10.20.250.255');
      });

      if (!connection.response) {
        connection.mockRespond(new Response(new ResponseOptions({
          body: ['vic-ova-2: v1.2.0-12000-bbbbbb, 10.20.250.255', 'vic-ova-1: v1.1.0-11000-aaaaaa, 10.20.250.254']
        })));
      }
    });

    it('should get value from cache if invoke ip address api second time', async() => {
      service.getVicApplianceIp().subscribe(response => {
        expect(response).toBe('10.20.250.255');
      });
    });

    it('should retrieve a list of distributed port groups', async() => {
      spyOn(service, 'getNetworkingTree').and.returnValue(ObservableNetWorkingResources);
      spyOn<any>(service, 'getDvsFromNetworkFolders').and.returnValue(ObservableFolderDSwitchList);
      spyOn<any>(service, 'getDvsHostsEntries').and.returnValue(ObservableDvsHostsEntriesList);
      spyOn<any>(service, 'getHostsFromComputeResource').and.returnValue(clusterHostsChilds);
      spyOn<any>(service, 'getDvsPortGroups').and
        .returnValue([...observableFolderDSwitchPorGroupsList, ...observableDcDSwitchPorGroupsList]);

      const serverInfoServiceGui = ' d7c361cc-0a46-441e-8e21-ac22debf7003';
      const selectedClusterResource1: ComputeResource = {
        serverGuid: serverInfoServiceGui,
        value: 'domain-c276',
        type: 'ClusterComputeResource',
        name: '10.192.109.234',
        parent: null,
        resourcePool: null,
        text: '10.192.109.234',
        nodeTypeId: COMPUTE_RESOURCE_NODE_TYPES.host.dc_stand_alone,
        objRef: 'urn:vmomi:ClusterComputeResource:host-276:d7c361cc-0a46-441e-8e21-ac22debf7003',
        aliases: ['alias-id1'],
        isEmpty: true
      };

      const selectedClusterResource2: ComputeResource = {
        serverGuid: serverInfoServiceGui,
        value: 'domain-c270',
        type: 'ClusterComputeResource',
        name: 'New Cluster',
        parent: null,
        resourcePool: null,
        text: 'New Cluster',
        nodeTypeId: COMPUTE_RESOURCE_NODE_TYPES.cluster.dc_cluster,
        objRef: 'urn:vmomi:ClusterComputeResource:domain-c270:d7c361cc-0a46-441e-8e21-ac22debf7003',
        aliases: ['alias-id1'],
        isEmpty: true
      };

      service.getDistributedPortGroups(null, selectedClusterResource1)
        .subscribe(data => {
          expect(data.length).toBe(3);
        });

      service.getDistributedPortGroups(null, selectedClusterResource2)
        .subscribe(data => {
          expect(data.length).toBe(3);
        });
    });

    it('should retrieve a ComputeResource from a ResourceBasicInfo', <any>fakeAsync((): void => {
      const basicResourceInfo = hostResourceBasicInfos[0];
      const expectedCompleteResourceInfo = hostComputeResources
        .find(resource => resource.value === basicResourceInfo.value);
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);

      service.getResourceCompleteInfo(basicResourceInfo)
        .subscribe((data: ComputeResource) => {
          expect(data.name).toBe(expectedCompleteResourceInfo.name);
          expect(data.parent).toBe(expectedCompleteResourceInfo.parent);
          expect(data.resourcePool).toBe(expectedCompleteResourceInfo.resourcePool);
          expect(data.objRef).toBe(expectedCompleteResourceInfo.objRef);
          expect(data.text).toBe(expectedCompleteResourceInfo.text);
        })

    }));

    it('should retrieve a ComputeResource list from a ResourceBasicInfo list', async() => {
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);

      service.getResourcesCompleteInfo(hostResourceBasicInfos)
        .subscribe((data: ComputeResource[]) => {
          expect(data.length).toBe(hostResourceBasicInfos.length);
          data.forEach((resource: ComputeResource, idx: number) => {
            expect(resource.name).toBe(hostComputeResources[idx].name);
            expect(resource.parent).toBe(hostComputeResources[idx].parent);
            expect(resource.resourcePool).toBe(hostComputeResources[idx].resourcePool);
            expect(resource.objRef).toBe(hostComputeResources[idx].objRef);
            expect(resource.text).toBe(hostComputeResources[idx].text);
          });
        })
    });

    it('should retrieve the requested properties', async() => {
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);

      service.getResourceProperties(hostComputeResources[0].objRef, resourceCompleteInfoProps)
        .subscribe((data: any) => {
          const expectedProperties = resourceCompleteInfoProps.split(',');
          expectedProperties.forEach((prop: string) => {
            expect(data.hasOwnProperty(prop)).toBe(true);
          });
        })
    });

    it('should return a list of Cluster and stand alone Hosts', async() => {
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);
      spyOn<any>(service, 'getResourcePoolsTree').and.returnValue(of([]));

      const clusters: ComputeResource[] = clusterComputeResources;
      const standAloneHosts: ComputeResource[] = hostComputeResources
        .filter((rci: ComputeResource) => resourceIsHost(rci.type) && (!rci.parent || !resourceIsCluster(rci.parent.type)));

      const expectedDcClustersAndStandAloneHosts = clusters.concat(standAloneHosts);

        service.getDcClustersAndStandAloneHosts(dcComputeResources[0])
        .subscribe((data: ComputeResource[]) => {
          expect(data.length).toBe(expectedDcClustersAndStandAloneHosts.length);
          data.forEach((resource: ComputeResource) => {
            const parentIsCluster = resource.parent ? resourceIsCluster(resource.parent.type) : false;
            expect(parentIsCluster).toBe(false);
          })
        })
    });

    it('should return a list of Hosts and ResourcePools from a Cluster', async() => {
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);
      spyOn<any>(service, 'getResourcePoolsTree').and.returnValue(of(rpComputeResources));

      service.getHostsAndResourcePoolsFromCluster(clusterComputeResources[0])
        .subscribe((data: ComputeResource[]) => {
          const hosts = data.filter(resource => resourceIsHost(resource.type));
          const rps = data.filter(resource => resourceIsResourcePool(resource.type));
          expect(data.length).toBe(5);
          expect(hosts.length).toBe(1);
          expect(rps.length).toBe(4);
        })
    });

    it('should not return any host from a Cluster which does not has any Host', async() => {
      spyOn<any>(service, 'getResourceProperties').and.callFake(getResourcePropertiesResponse);

      service.getHostsFromComputeResource(clusterComputeResources[1])
        .subscribe((data: ComputeResource[]) => {
          expect(data.length).toBe(0);
        })
    });

});
