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

import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';

import {
  CHECK_RP_UNIQUENESS_URL,
  CPU_MIN_LIMIT_MHZ,
  GET_CLONE_TICKET_URL,
  MEMORY_MIN_LIMIT_MB,
  VIC_APPLIANCES_LOOKUP_URL,
  VIC_APPLIANCE_PORT
} from '../shared/constants';
import { Http, URLSearchParams } from '@angular/http';

import { GlobalsService } from '../shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { byteToLegibleUnit } from '../shared/utils/filesize';

@Injectable()
export class CreateVchWizardService {
    // TODO: make a proper interface
    private _datacenter: any[] = null;
    private _userId: string = null;
    private _serverGuid: string = null;
    private _serverThumbprint: string = null;
    private _serverHostname: string = null;
    private _clusters: any[] = null;
    private _clusterToHostRpsMap = {};
    private _networkingTree: any[] = null;
    private _distributedPortGroups: any[] = null;
    private _userSession: any = null;
    private _latestVicApplianceIp: string = null;

    constructor(
        private http: Http,
        private globalsService: GlobalsService
    ) {
        this.getUserSession();
    }

    getUserSession() {
        const webPlatform = <any>this.globalsService.getWebPlatform();
        if (typeof webPlatform.getUserSession === 'function') {
            this._userSession = webPlatform.getUserSession();
        }
    }

    /**
     * Validate the provided name against VC inventories in a way that
     * checks if there is any VirtualApp or ResourcePool with the same
     * @param {string} name Name provided by the user
     * @returns {Observable<boolean>} Observable containing whether the name is unique
     */
    checkVchNameUniqueness(name: string): Observable<boolean> {
        const params = new URLSearchParams();
        params.set('name', name);
        return this.http.post(CHECK_RP_UNIQUENESS_URL, params)
            .catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e));
    }

     /**
     * Gets a clone ticket from vSphere api to be passed to vic-machine-server
     * @returns {Observable<string>} Observable containing the clone ticket
     */
    acquireCloneTicket(): Observable<string> {
      return this.http.get(GET_CLONE_TICKET_URL)
          .catch(e => Observable.throw(e))
          .map(response => response.text())
          .catch(e => Observable.throw(e));
    }

    /**
     * Get user id
     */
    getUserId(): string {
        if (!this._userId) {
            this._userId = this._userSession['userName'];
        }
        return this._userId;
    }

    /**
     * Get serverGuid for the current VC
     */
    getServerGuid(): string {
        if (!this._serverGuid) {
            // TODO: come up with a better solution to handle a case where
            // linked datacenters are involved in a VC
            this._serverGuid = this._userSession['serversInfo'][0]['serviceGuid'];
        }
        return this._serverGuid;
    }

    /**
     * Get VC's thumbprint
     * TODO: unit test, refactor
     */
    getServerThumbprint(): string {
        if (!this._serverThumbprint) {
            // TODO: see line 76
            this._serverThumbprint = this._userSession['serversInfo'][0]['thumbprint'];
        }
        return this._serverThumbprint;
    }

    /**
     * Get VC's hostname
     * TODO: unit test, refactor
     */
    getVcHostname(): string {
        if (!this._serverHostname) {
            // TODO: see line 76
            this._serverHostname = this._userSession['serversInfo'][0]['name'];
        }
        return this._serverHostname;
    }

    /**
     * Get datacenter for the current VC
     * TODO: unit test
     */
    getDatacenter(): Observable<any[]> {
        if (this._datacenter) {
            return Observable.of(this._datacenter);
        } else {
            const serverGuid = this.getServerGuid();
            return this.http.get('/ui/tree/children?nodeTypeId=VcRoot' +
                `&objRef=urn:vmomi:Folder:group-d1:${serverGuid}&treeId=vsphere.core.physicalInventorySpec`)
                .catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e))
                .map(response => {
                    this._datacenter = response;
                    return this._datacenter;
                });
        }
    }

    /**
     * Queries the H5 Client for clusters
     */
    getClustersList(): Observable<any[]> {
        return this.getDatacenter()
                   .switchMap(dc => {
                     return this.http.get('/ui/tree/children?nodeTypeId=RefAsRoot' +
                     `&objRef=${dc[0]['objRef']}` +
                     '&treeId=DcHostsAndClustersTree');
                    })
                    .catch(e => Observable.throw(e))
                    .map(response => response.json())
                    .catch(e => Observable.throw(e));
    }

    /**
     * Queries the H5 Client for hosts, vapps and resourcepools
     * for the given cluster object id
     */
    getHostsAndResourcePools(clusterObjId: string): Observable<any[]> {
        return this.http.get('/ui/tree/children?nodeTypeId=DcCluster' +
                   `&objRef=${clusterObjId}` +
                   '&treeId=DcHostsAndClustersTree')
                   .catch(e => Observable.throw(e))
                   .map(response => response.json())
                   .catch(e => Observable.throw(e))
                   .map(response => response.filter(
                       item => item['nodeTypeId'] !== 'ClusterResPool'));
    }

    getResourceAllocationsInfo(resourceObjId: string, isCluster: boolean): Observable<any> {
        if (isCluster) {
            return this.http.get(`/ui/data/${resourceObjId}` +
                '?model=com.vmware.vsphere.client.clusterui.model.ResourcePoolConfigData')
                .catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e))
                .map(response => {
                    const memory = response['runtimeInfo']['memory'];
                    const cpu = response['runtimeInfo']['cpu'];
                    memory['maxUsage'] = Math.round(memory['maxUsage'] / 1024 / 1024);
                    memory['minUsage'] = MEMORY_MIN_LIMIT_MB;
                    memory['unreservedForPool'] = Math.round(memory['unreservedForPool'] / 1024 / 1024);
                    cpu['minUsage'] = CPU_MIN_LIMIT_MHZ;
                    return {
                        cpu: cpu,
                        memory: memory
                    };

                });
        } else {
            // host
            return this.http.get(`/ui/data/properties/${resourceObjId}` +
                '?properties=systemResources')
                .catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e))
                .map(response => {
                    const config = response['systemResources']['config'];
                    return {
                        cpu: {
                            maxUsage: config['cpuAllocation']['limit'],
                            minUsage: CPU_MIN_LIMIT_MHZ,
                            unreservedForPool: config['cpuAllocation']['reservation'],
                            shares: config['cpuAllocation']['shares']['shares']
                        },
                        memory: {
                            maxUsage: config['memoryAllocation']['limit'],
                            minUsage: MEMORY_MIN_LIMIT_MB,
                            unreservedForPool: config['memoryAllocation']['reservation'],
                            shares: config['memoryAllocation']['shares']['shares']
                        }
                    };
                });
        }

    }

    getDatastores(resourceObjRef: string): Observable<any[]> {
        return this.http.get('/ui/data/properties/' +
            `${resourceObjRef}?properties=datastore`)
            .catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e))
            .switchMap(response => {
                const refs = response['datastore'].map(ref => {
                    return `urn:vmomi:Datastore:${ref['value']}:${ref['serverGuid']}`;
                });
                const obsArray = refs.map(objRef => {
                    return this.http.get('/ui/data/properties/' +
                        `${objRef}?properties=name,info,overallStatus`)
                        .catch(e => Observable.throw(e))
                        .map(rsp => rsp.json())
                        .do(rsp => {
                            rsp['info']['freeSpace'] = byteToLegibleUnit(rsp['info']['freeSpace']);
                        })
                        .catch(e => Observable.throw(e));
                });
                return Observable.zip.apply(null, obsArray);
            });
    }

    getNetworkingTree(): Observable<any[]> {
        // cache
        if (this._networkingTree !== null) {
            return Observable.of(this._networkingTree);
        }

        return this.getDatacenter()
            .switchMap(dcs => {
                return this.http.get('/ui/tree/children?nodeTypeId=Datacenter' +
                    `&objRef=${dcs[0]['objRef']}&treeId=vsphere.core.networkingInventorySpec`)

            }).catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e))
            .do(tree => this._networkingTree = tree);
    }

    getDistributedPortGroups(): Observable<any[]> {
        // cache
        if (this._distributedPortGroups !== null) {
            return Observable.of(this._distributedPortGroups);
        }

        return this.getNetworkingTree()
            .switchMap(inventories => {
                const obsArray: Array<Observable<any>> =
                    inventories.filter(item => item['nodeTypeId'] === 'DcDvs')
                        .map(dv => {
                            return this.http.get('/ui/tree/children?nodeTypeId=DcDvs' +
                                `&objRef=${dv['objRef']}&treeId=vsphere.core.networkingInventorySpec`)
                                .map(response => response.json());
                        });
                return Observable.from(obsArray);
            })
            .mergeAll()
            .mergeMap(val => {
                this._distributedPortGroups = val;
                return Observable.of(this._distributedPortGroups);
            });
    }

    /**
     * Look up and return from the vSphere inventory name, version and IP address
     * for all VIC appliance VMs
     * @returns {Observable<string[]>} array of VIC appliances info sorted by build #
     */
    private getVicAppliancesList(): Observable<string[]> {
      return this.http.get(VIC_APPLIANCES_LOOKUP_URL)
        .catch(err => Observable.throw(err))
        .map(response => response.json());
    }

    /**
     * Get the IP address of the newest VIC appliance
     */
    public getVicApplianceIp(): Observable<string> {
      return this.getVicAppliancesList()
        .catch(err => Observable.throw(err))
        .switchMap((list: string[]) => {
          if (!list || !list.length) {
            throw new Error('No VIC appliance was detected');
          }
          const splitByColon = list[0].split(':');
          const ipAddress = splitByColon[1].split(',')[1].trim();
          return Observable.of(ipAddress);
        })
        .catch(err => Observable.throw(err));
    }

    /**
     * Verify VIC Appliance VM is reachable and API server is communicatable with the browser
     */
    public verifyVicMachineApiEndpoint(): Observable<any | null> {
      return this.getVicApplianceIp()
        .catch((err: Error) => {
          return Observable.throw({
            type: 'vm_not_found'
          });
        })
        .switchMap(ip => {
          return this.http.get(`https://${ip}:8443/container/hello`)
            .catch((err: Response) => {
              console.error(err);
              // network error. details are not visible in the browser level
              // however, we are fairly confident in most cases that this is caused by the
              // self-signed SSL certificate being blocked by the browser
              if (err.status === 0) {
                return Observable.throw({
                  type: 'ssl_cert',
                  payload: ip
                });
              }
              // handle http response status codes such as 404, 500, etc.
              return Observable.throw({
                type: 'other',
                payload: err
              });
            })
            .map(response => ip);
        });
    }
}
