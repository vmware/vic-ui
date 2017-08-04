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
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import { CHECK_RP_UNIQUENESS_URL } from '../shared/constants';
import { GlobalsService } from '../shared';

@Injectable()
export class CreateVchWizardService {
    // TODO: make a proper interface
    private _vchManifest: any;
    private _datacenter: any[] = null;
    private _userId: string = null;
    private _serverGuid: string = null;
    private _serverThumbprint: string = null;
    private _serverHostname: string = null;
    private _clusters: any[] = null;
    private _clusterToHostRpsMap = {};
    private _networkingTree: any[] = null;
    private _distributedPortGroups: any[] = null;

    constructor(
        private http: Http,
        private globalsService: GlobalsService
    ) {
        this.getWipManifest();
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

    // TODO: to be implemented
    getWipManifest() {
    }

    get vchManifest() {
        return this._vchManifest;
    }

    /**
     * Get user id
     */
    getUserId(): string {
        if (!this._userId) {
            const userSession = <any>this.globalsService.getWebPlatform().getUserSession();
            this._userId = userSession['userName'];
        }
        return this._userId;
    }

    /**
     * Get serverGuid for the current VC
     */
    getServerGuid(): string {
        if (!this._serverGuid) {
            // TODO: improve, refactor
            const userSession = <any>this.globalsService.getWebPlatform().getUserSession();
            this._serverGuid = userSession['serversInfo'][0]['serviceGuid'];
        }
        return this._serverGuid;
    }

    /**
     * Get VC's thumbprint
     * TODO: unit test, refactor
     */
    getServerThumbprint(): string {
        if (!this._serverThumbprint) {
            const userSession = <any>this.globalsService.getWebPlatform().getUserSession();
            this._serverThumbprint = userSession['serversInfo'][0]['thumbprint'];
        }
        return this._serverThumbprint;
    }

    /**
     * Get VC's hostname
     * TODO: unit test, refactor
     */
    getVcHostname(): string {
        if (!this._serverHostname) {
            const userSession = <any>this.globalsService.getWebPlatform().getUserSession();
            this._serverHostname = userSession['serversInfo'][0]['name'];
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
        // TODO: support vapp and resourcepools to be shown (or check with backend)
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
        // TODO: cache
        if (isCluster) {
            return this.http.get(`/ui/data/${resourceObjId}` +
                '?model=com.vmware.vsphere.client.clusterui.model.ResourcePoolConfigData')
                .catch(e => Observable.throw(e))
                .map(response => response.json())
                .catch(e => Observable.throw(e))
                .map(response => {
                    const memory = response['runtimeInfo']['memory'];
                    memory['maxUsage'] = Math.round(memory['maxUsage'] / 1024 / 1024);
                    memory['unreservedForPool'] = Math.round(memory['unreservedForPool'] / 1024 / 1024);
                    return {
                        cpu: response['runtimeInfo']['cpu'],
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
                            unreservedForPool: config['cpuAllocation']['reservation'],
                            shares: config['cpuAllocation']['shares']['shares']
                        },
                        memory: {
                            maxUsage: config['memoryAllocation']['limit'],
                            unreservedForPool: config['memoryAllocation']['reservation'],
                            shares: config['memoryAllocation']['shares']['shares']
                        }
                    };
                });
        }

    }

    getDatastores(datacenterObjId: string): Observable<any[]> {
        // TODO: cache
        return this.http.get('/ui/tree/children?nodeTypeId=Datacenter' +
            `&objRef=${datacenterObjId}&treeId=vsphere.core.storageInventorySpec`)
            .catch(e => Observable.throw(e))
            .map(response => response.json())
            .catch(e => Observable.throw(e));
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
