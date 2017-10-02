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
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import { CHECK_RP_UNIQUENESS_URL, CPU_MIN_LIMIT_MHZ, MEMORY_MIN_LIMIT_MB } from '../shared/constants';
import { GlobalsService } from '../shared';
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
                `&objRef=urn:vmomi:Folder:group-d1:${serverGuid}&treeId=VmFoldersTree`)
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
        // TODO: refactor. e.g. move constants to constant file
        if (this._clusters !== null) {
            // if there is a cache for clusters, return immediately
            return Observable.of(this._clusters);
        } else {
            return this.getDatacenter()
                .switchMap(dc => {
                    return this.http.get('/ui/tree/children?nodeTypeId=RefAsRoot' +
                        `&objRef=${dc[0]['objRef']}` +
                        '&treeId=DcHostsAndClustersTree');
                }).catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e));
        }
    }

    /**
     * Queries the H5 Client for hosts, vapps and resourcepools
     * for the given cluster object id
     */
    getHostsAndResourcePools(clusterObjId: string): Observable<any[]> {
        // TODO: refactor. e.g. move constants to constant file
        if (this._clusterToHostRpsMap[clusterObjId]) {
            // if there is a cache for the provided cluster object id, return immediately
            return Observable.of(this._clusterToHostRpsMap[clusterObjId]);
        } else {
            return this.http.get('/ui/tree/children?nodeTypeId=DcCluster' +
                `&objRef=${clusterObjId}` +
                '&treeId=DcHostsAndClustersTree')
                .catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e))
                .map(response => response.filter(
                    item => item['nodeTypeId'] !== 'ClusterResPool'))
                .do(response => {
                    // cache the results
                    this._clusterToHostRpsMap[clusterObjId] = response;
                });
        }
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

}
