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
import { Observable } from 'rxjs/Observable';
import {
    BaseRequestOptions,
    ConnectionBackend,
    RequestOptions,
    Http,
    Response,
    ResponseOptions,
    ResponseType,
    XHRBackend,
    Headers
} from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { JASMINE_TIMEOUT } from '../testing/jasmine.constants';
import { CreateVchWizardService } from './create-vch-wizard.service';
import { Globals, GlobalsService } from '../shared';
import {
  clusterHostsChilds,
  computeResourcesRealName,
  dcClustersAndStandAloneHosts,
  dcDSwitchPorGroupsList, dcMockData, dvsHostsEntries,
  folderDSwitchList, folderDSwitchPorGroupsList,
  netWorkingResources
} from './mocks/create-vch-wizard-mocked-data';
import {ComputeResource} from '../interfaces/compute.resource';
import {COMPUTE_RESOURCE_NODE_TYPES} from '../shared/constants';

describe('CreateVchWizardService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = JASMINE_TIMEOUT;
    let service: CreateVchWizardService;
    let connection: MockConnection;
    let backend: MockBackend;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                CreateVchWizardService,
                Http,
                { provide: ConnectionBackend, useClass: MockBackend },
                { provide: RequestOptions, useClass: BaseRequestOptions },
                Globals,
                GlobalsService
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

      connection.mockRespond(new Response(new ResponseOptions({
        body: ['vic-ova-2: v1.2.0-12000-bbbbbb, 10.20.250.255', 'vic-ova-1: v1.1.0-11000-aaaaaa, 10.20.250.254']
      })));
    });

    it('should handle invalid response from VIC appliance lookup endpoint', async() => {
      service.getVicApplianceIp().subscribe(response => {}, err => {
        expect(err).toBeTruthy();
      });

      connection.mockRespond(new Response(new ResponseOptions({
        body: 'not an array of string values'
      })));
    });

    it('should retrieve a list of distributed port groups', async() => {
      spyOn(service, 'getNetworkingTree').and.returnValue(Observable.of(netWorkingResources));
      spyOn<any>(service, 'getDvsFromNetworkFolders').and.returnValue(Observable.of(folderDSwitchList));
      spyOn<any>(service, 'getDvsPortGroups').and.returnValue([...folderDSwitchPorGroupsList, ...dcDSwitchPorGroupsList]);
      spyOn<any>(service, 'getDvsHostsEntries').and.returnValue(dvsHostsEntries);
      spyOn<any>(service, 'getHostsFromComputeResource').and.returnValue(clusterHostsChilds);

      const selectedHostResource: ComputeResource = {
        text: '10.192.109.234',
        nodeTypeId: COMPUTE_RESOURCE_NODE_TYPES.host.dc_stand_alone,
        objRef: 'urn:vmomi:ClusterComputeResource:host-276:d7c361cc-0a46-441e-8e21-ac22debf7003',
        aliases: ['alias-id1'],
        isEmpty: true
      };

      const selectedClusterResource: ComputeResource = {
        text: 'New Cluster',
        nodeTypeId: COMPUTE_RESOURCE_NODE_TYPES.cluster.dc_cluster,
        objRef: 'urn:vmomi:ClusterComputeResource:domain-c270:d7c361cc-0a46-441e-8e21-ac22debf7003',
        aliases: ['alias-id1'],
        isEmpty: true
      };

      service.getDistributedPortGroups(null, selectedHostResource)
        .subscribe(data => {
          expect(data.length).toBe(3);
        });

      service.getDistributedPortGroups(null, selectedClusterResource)
        .subscribe(data => {
          expect(data.length).toBe(3);
        });
    });

    it('should return a list of Compute Resources with a property called realName', async() => {
      spyOn(service, 'getDatacenter').and.returnValue(Observable.of(dcMockData));
      spyOn<any>(service, 'getDcClustersAndStandAloneHosts').and.returnValue(Observable.of(dcClustersAndStandAloneHosts));
      spyOn<any>(service, 'getComputeResourceRealName').and.returnValue(Observable.of(computeResourcesRealName[0]));

      service.getClustersList(null)
        .subscribe(data => {
          expect(data.length).toBe(1);
          expect(data[0].realName).toBeTruthy();
          expect(data[0].realName).toBe(computeResourcesRealName[0].name);
        });

    });

});
