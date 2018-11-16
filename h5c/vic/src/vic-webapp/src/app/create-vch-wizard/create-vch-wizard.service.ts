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
  CHECK_RP_UNIQUENESS_URL,
  CPU_MIN_LIMIT_MHZ,
  GET_CLONE_TICKET_URL,
  MEMORY_MIN_LIMIT_MB,
  VIC_APPLIANCES_LOOKUP_URL,
} from '../shared/constants';
import { Http, URLSearchParams } from '@angular/http';

import { GlobalsService } from '../shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/mergeMap';
import { byteToLegibleUnit } from '../shared/utils/filesize';
import { flattenArray } from '../shared/utils/array-utils';
import {
  getMorIdFromObjRef,
  getServerServiceGuidFromObj,
  resourceIsCluster,
  resourceIsHost,
  resourceIsResourcePool
} from '../shared/utils/object-reference';
import { ResourceBasicInfo, ComputeResource } from '../interfaces/compute.resource';
import { globalProperties } from '../../environments/global-properties';
import { HttpClient } from '@angular/common/http';
import { VirtualContainerHost } from '../vch-view/vch.model';
import { VicVmViewService } from '../services/vm-view.service';
import { concat } from '../../../node_modules/rxjs/operators';

@Injectable()
export class CreateVchWizardService {
  // TODO: make a proper interface
  private _userId: string = null;
  private _serverGuid: string[] = [];
  private _userSession: any = null;
  private _appliance: Observable<string[]>;

  constructor(
    private http: Http,
    private httpClient: HttpClient,
    private globalsService: GlobalsService,
    private vicVmViewService: VicVmViewService
  ) {
    this.getUserSession();
    this._appliance = this.setAppliance();
  }

  setAppliance(): Observable<string[]> {
    return this.http.get(VIC_APPLIANCES_LOOKUP_URL)
      .publishReplay(1, 2000)
      .refCount()
      .take(1)
      .catch(err => Observable.throw(err))
      .map(response => response.json());
  }

  getAppliance() {
    return this._appliance;
  }

  getClusterConfiguration(objRef: string): Observable<any[]> {
    const url = `/ui/data/properties/${objRef}?properties=configuration`;
    return this.http.get(url)
      .catch(e => Observable.throw(e))
      .map(response => response.json());
  }

  getClusterDrsStatus(objRef: string): Observable<boolean> {
    return this.getClusterConfiguration(objRef)
      .map(response => {
        return response['configuration']['drsConfig']['enabled'];
      })
  }

  getClusterVMGroups(objRef: string): Observable<any[]> {
    const url = `/ui/data/properties/${objRef}?properties=ClusterComputeResource/configurationEx/group`;
    return this.http.get(url)
      .catch(e => Observable.throw(e))
      .map(response => response.json());
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
  acquireCloneTicket(serviceGuid: string): Observable<string> {
    const params = new URLSearchParams();
    params.set('serviceGuid', serviceGuid);
    return this.http.post(GET_CLONE_TICKET_URL, params)
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
   * Get serverGuid
   */
  getServerGuidFromDcObjRef(): string[] {
    if (!this._serverGuid) {
      this._serverGuid = this._userSession['serversInfo'].map(server => server['serviceGuid']);
    }
    return this._serverGuid;
  }

  /**
   * Gets the complementary info (ComputeResource) from a ResourceBasicInfo resource (e.g. name, parent, resourcePool)
   * @param {ResourceBasicInfo} resourceBasicInfo
   * @returns {Observable<ComputeResource>}
   */
  getResourceCompleteInfo(resourceBasicInfo: ResourceBasicInfo): Observable<ComputeResource> {
    const objRef = `urn:vmomi:${resourceBasicInfo.type}:${resourceBasicInfo.value}:${resourceBasicInfo.serverGuid}`;
    const props = 'name,parent,resourcePool';
    return this.getResourceProperties<{ name: string; parent: ResourceBasicInfo; resourcePool: ResourceBasicInfo }>(objRef, props)
      .map(resourceCompleteInfo => {
        // element could have a single resourcePool or an Array of resourcePools
        const resPoolInfo: ResourceBasicInfo = resourceCompleteInfo.resourcePool;
        const resPoolObjRef: string[] = [];
        if (resPoolInfo) {
          if (!Array.isArray(resPoolInfo)) {
            // if element's resourcePool return is not an Array, we need to insert the single element into the array
            resPoolObjRef.push(`urn:vmomi:${resPoolInfo.type}:${resPoolInfo.value}:${resPoolInfo.serverGuid}`);
          } else {
            // if element's resourcePool return is an Array, we need to insert each element...
            resPoolInfo.forEach(resPoolElement => {
              const ref = `urn:vmomi:${resPoolElement.type}:${resPoolElement.value}:${resPoolElement.serverGuid}`;
              resPoolObjRef.push(ref);
            })
          }
        }

        return ({
          ...resourceBasicInfo,
          ...resourceCompleteInfo,
          text: resourceCompleteInfo.name,
          nodeTypeId: resourceBasicInfo.type,
          objRef: objRef,
          aliases: resPoolObjRef
        })
      })
  }

  /**
   * Gets the complementary info (ComputeResource) from a list of ResourceBasicInfo resource (e.g. name, parent, resourcePool)
   * @param {ResourceBasicInfo[]} basicInfoList
   * @returns {Observable<ComputeResource[]>}
   */
  getResourcesCompleteInfo(basicInfoList: ResourceBasicInfo[]): Observable<ComputeResource[]> {
    if (basicInfoList) {
      const infoListObs: Observable<ComputeResource>[] = basicInfoList
        .map(resourceBasicInfo => {
          return this.getResourceCompleteInfo(resourceBasicInfo)
        });
      return infoListObs.length > 0 ? Observable.zip(...infoListObs) : Observable.of([]);
    } else {
      return Observable.of([]);
    }
  }

  /**
   * Gets a list of properties from an specific resource.
   * Desired properties should be comma separated values (e.g. 'name,parent,resourcePool')
   * @param {string} objRef
   * @param {string} properties
   * @returns {Observable<ResponseType[]>}
   */
  getResourceProperties<ResponseType>(objRef: string, properties: string): Observable<ResponseType> {
    const url = `${globalProperties.vicService.paths.properties}${objRef}?properties=${properties}`;
    return this.httpClient.get<ResponseType>(url);
  }

  /**
   * Gets datacenter for the current VC
   * TODO: unit test
   */
  getDatacenter(serverGuid: string): Observable<ComputeResource[]> {
    const objRef = `urn:vmomi:Folder:group-d1:${serverGuid}`;
    const props = 'childEntity';
    return this.getResourceProperties<ResourceBasicInfo>(objRef, props)
      .switchMap(data => {
          const results = data['childEntity'];
          const folderEntities = results.filter(result => result && result.type === 'Folder');
          const dcEntities = results.filter(result => result && result.type === 'Datacenter');
          const nestedDcEntities = this.getDcUnderFolder(Observable.of(folderEntities));
          return nestedDcEntities.switchMap( result => {
            let resultEntities;
            resultEntities = flattenArray(result);
            return this.getResourcesCompleteInfo(resultEntities.concat(dcEntities))
          } )
        });
  }

  getDcUnderFolder(entitiesObs: Observable <any[]>): Observable<any[]> {
    return entitiesObs.switchMap( entities => {
       if (entities && entities.length > 0) {
         const entitiObs = entities.map(data => {
          if (data && data.type === 'Folder') {
            const url = `${globalProperties.vicService.paths.properties}urn:vmomi:` +
            `${data.type}:${data.value}:${data.serverGuid}?properties=childEntity`;
            const childEntityObservable = this.http.get(url)
              .catch(e => Observable.throw(e))
              .map(response => response.json())
              .map(response => response['childEntity']);
            return this.getDcUnderFolder(childEntityObservable);
          } else if (data && data.type === 'Datacenter') {
            return Observable.of(data);
          } else {
            return Observable.of([]);
          }
        });
        return Observable.forkJoin(...entitiObs);
       } else {
         return Observable.of([]);
       }
      })
    }

  /**
   * Queries the H5 Client for Clusters and stand alone Hosts from the desired DC
   */
  getDcClustersAndStandAloneHosts(dcObj: ComputeResource): Observable<ComputeResource[]> {
    const props = 'host,cluster';
    return this.getResourceProperties<{ host: ResourceBasicInfo[]; cluster: ResourceBasicInfo[] }>(dcObj.objRef, props)
      .map(data => {
        if (data['cluster']) {
          return {
            childResources: data['cluster'].concat(data['host'])
          }
        } else {
          return {
            childResources: data['host']
          }
        }
      })
      .switchMap(basicData => {
        return this.getResourcesCompleteInfo(basicData.childResources)
          .switchMap((completeData: ComputeResource[]) => {

            const clusters: ComputeResource[] = completeData
              .filter((rci: ComputeResource) => resourceIsCluster(rci.type));

            const standAloneHosts: ComputeResource[] = completeData
              .filter((rci: ComputeResource) => resourceIsHost(rci.type) && (!rci.parent || !resourceIsCluster(rci.parent.type)));

            if (standAloneHosts.length > 0) {
              // if we have stand alone Hosts, we want to fetch also its childs (resource pool tree)
              const standAloneHostsWithChilds: Observable<ComputeResource>[] = standAloneHosts.map(host => {
                return this.getResourcePoolsTree(host.aliases[0], host)
                  .map(resourcePoolTreeList => {
                    host.childs = resourcePoolTreeList;
                    return host;
                  })
              });
              return Observable.zip(...standAloneHostsWithChilds)
                .map(hostsWithChilds => {
                  return clusters.concat(hostsWithChilds)
                });

            } else {
              // if we don't have stand alone Host, we only return Cluster list
              return Observable.of(clusters);
            }
          })
      })
      .map((list: ComputeResource[]) => {
        // sets the reference to the DC object for each Cluster and stand alone Host
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = dcObj);
        return list;
      })
  }

  /**
   * Gets a nested tree of ResourcePools.
   * @param {string} parentResourcePoolRef
   * @param {ComputeResource} rootParentComputeResource
   * @returns {Observable<ComputeResource[]>}
   */
  getResourcePoolsTree(parentResourcePoolRef: string, rootParentComputeResource: ComputeResource = null): Observable<ComputeResource[]> {
    return this.getResourceProperties<{ resourcePool: ResourceBasicInfo[] }>(parentResourcePoolRef, 'resourcePool')
      .map(data => data['resourcePool'] ? data['resourcePool'] : [])
      .switchMap(data => data.length > 0 ? this.getResourcesCompleteInfo(data) : Observable.of([]))
      .map((list: ComputeResource[]) => {
        // sets the reference to the Cluster object for each Host and ResourcePool
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = rootParentComputeResource);
        return list;
      })
      .switchMap((resourcePoolList: ComputeResource[]) => {
        const resourcePoolListObs = resourcePoolList.map((resPool: ComputeResource) => {
          return this.getResourcePoolsTree(resPool.objRef, rootParentComputeResource)
            .map((childResPool: ComputeResource[]) => {
              resPool.childs = childResPool.length > 0 ? childResPool : [];
              return resPool;
            })
        });

        return resourcePoolListObs.length > 0 ? Observable.zip(...resourcePoolListObs) : Observable.of([]);
      })
  }

  /**
   * Queries the H5 Client for hosts, and resourcepools
   * for the given cluster object id
   */
  getHostsAndResourcePoolsFromCluster(cluster: ComputeResource): Observable<ComputeResource[]> {
    return this.getResourceProperties<{ host: ResourceBasicInfo[] }>(cluster.objRef, 'host')
      .switchMap(hostAndRootResPool => {
        const hosts: ResourceBasicInfo[] = hostAndRootResPool['host'] ? hostAndRootResPool['host'] : [];
        // const rootResPool: ResourceBasicInfo = hostAndRootResPool['resourcePool'];
        // const rootResPoolRef: string = `urn:vmomi:ResourcePool:${rootResPool.value}:${rootResPool.serverGuid}`;
        return this.getResourcePoolsTree(cluster.aliases[0], cluster)
          .map(resPoolList => {
            return { childResources: hosts.concat(resPoolList) };
          })
      })
      .switchMap(data => this.getResourcesCompleteInfo(data.childResources))
      .map((list: ComputeResource[]) => {
        // sets the reference to the Cluster object for each Host and ResourcePool
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = cluster);
        return list;
      })
  }

  /**
   * Gets a list of existing VirtualContainerHost
   * @returns {Observable<VirtualContainerHost[]>}
   */
  getVicVchsInfo(): Observable<VirtualContainerHost[]> {
    // since we are inside an iframe, we should fetch the vchs data to be used later...
    this.vicVmViewService.getVchsData({});
    return this.vicVmViewService.vchs$;
  }

  /**
   * Gets a list of the names of the existing ResourcePools containing VirtualContainerHost
   * @returns {Observable<string[]>}
   */
  getVicResourcePoolList(): Observable<string[]> {
    return this.getVicVchsInfo()
      .map(vchsInfo => {
        const vchsRPNames: string[] = vchsInfo
          .filter(vch => resourceIsResourcePool(vch.parentType))
          .map(vch => vch.parentValue);
        return vchsRPNames;
      })
  }

  /**
   * Queries the H5 Client for ClusterHostSystems for all DcClusters
   * @param clusters
   */
  getHostsAndResourcePoolsFromClusters(clusters: ComputeResource[]): Observable<ComputeResource[]> {
    return Observable.from(clusters)
      .concatMap((cluster: ComputeResource) => {
        return this.getHostsAndResourcePoolsFromCluster(cluster);
      });
  }

  /**
   * Gets the allocations info from a resource
   * @param {string} resourceObjId
   * @param {boolean} isHost
   * @returns {Observable<any>}
   */
  getResourceAllocationsInfo(resourceObjId: string, isHost: boolean): Observable<any> {
    if (!isHost) {
      return this.getResourceProperties<{ runtime: any }>(resourceObjId, 'runtime')
        .catch(e => Observable.throw(e))
        .map(response => {
          const memory = response['runtime']['memory'];
          const cpu = response['runtime']['cpu'];
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
      return this.getResourceProperties<{ systemResources: any }>(resourceObjId, 'systemResources')
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
        if (!response.hasOwnProperty('datastore') || response['datastore'] === null) {
          return Observable.of([]);
        }

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

  getNetworkingTree(dcObj: ComputeResource): Observable<any[]> {
    const serviceGuid = getServerServiceGuidFromObj(dcObj);
    return this.getDatacenter(serviceGuid)
      .switchMap(dcs => {
        const dcsObs = dcs.map(dc => {
          return this.http.get('/ui/tree/children?nodeTypeId=Datacenter' +
            `&objRef=${dc['objRef']}&treeId=vsphere.core.networkingInventorySpec`)
            .map(response => response.json())
        });

        return Observable.zip.apply(null, dcsObs);
      })
      .map((response: any[]) => {
        return flattenArray(response);
      });
  }

  /**
   * Returns all the Dvs contained on each network folder
   * @param {ComputeResource[]} networkFolders
   * @returns {Observable<ComputeResource[]>}
   */
  private getDvsFromNetworkFolders(networkFolders: ComputeResource[]): Observable<ComputeResource[]> {
    if (!networkFolders || networkFolders.length === 0) {
      return Observable.of([]);
    }
    return Observable.from(networkFolders)
      .mergeMap((networkFolder: ComputeResource) => {
        return this.http.get('/ui/tree/children?nodeTypeId=DcNetworkFolder' +
          `&objRef=${networkFolder['objRef']}&treeId=vsphere.core.networkingInventorySpec`)
          .map(response => response.json());
      })
      .toArray();
  }

  /**
   * create an array of observables for DVS portgroup entries
   * @param {ComputeResource[]} dvsList
   * @returns {Observable<ComputeResource>[]}
   */
  private getDvsPortGroups(dvsList: ComputeResource[]): Observable<ComputeResource>[] {
    return dvsList.map(dv => {
      return this.http.get('/ui/tree/children?nodeTypeId=DcDvs' +
        `&objRef=${dv['objRef']}&treeId=vsphere.core.networkingInventorySpec`)
        .map(response => response.json());
    });
  }

  /**
   * Creates an array of observables for DVS host entries
   * @param {ComputeResource[]} dvsList
   * @returns {Observable<ResourceBasicInfo>[]}
   */
  private getDvsHostsEntries(dvsList: ComputeResource[]): Observable<ResourceBasicInfo[]>[] {
    return dvsList.map(dv => this.getHostsFromComputeResource(dv));
  }

  /**
   * Returns all the host contained in a ComputeResource Object (eg: Cluster)
   * @param {ComputeResource} obj
   * @returns {Observable<ResourceBasicInfo[]>}
   */
  getHostsFromComputeResource(obj: ComputeResource): Observable<ResourceBasicInfo[]> {
    return this.getResourceProperties(obj.objRef, 'host')
      .map(data => data['host'] ? data['host'] : []);
  }

  /**
   * Get all available portgroups for the selected compute resource
   * @param dcObj selected datacenter object
   * @param resourceObj the selected compute resource
   */
  getDistributedPortGroups(dcObj: ComputeResource, resourceObj: ComputeResource): Observable<any> {
    const resourceObjIsCluster = resourceIsCluster(resourceObj.type);
    let nsxtNetworks: ComputeResource[] = [];
    let dcNetworks: ComputeResource[] = [];
    return this.getNetworkingTree(dcObj)
      .switchMap((networkingResources: ComputeResource[]) => {
        // gets the list of Dvs from the dc and or any existing network folder
        const dcDvsList: ComputeResource[] = networkingResources.filter(item => item['nodeTypeId'] === 'DcDvs');
        nsxtNetworks = networkingResources.filter(item => item['nodeTypeId'] === 'DcOpaqueNetwork');
        dcNetworks = networkingResources.filter(item => item['nodeTypeId'] === 'DcNetwork');
        const networkFolders: ComputeResource[] = networkingResources.filter(item => item['nodeTypeId'] === 'DcNetworkFolder');
        return this.getDvsFromNetworkFolders(networkFolders)
          .map((NetworkFolderDvsList: ComputeResource[]) => ([...dcDvsList, ...flattenArray(NetworkFolderDvsList)]));
      })
      .switchMap(dvsList => {
        // create an array of observables for DVS portgroup entries
        const dvsObs: Observable<ComputeResource>[] = this.getDvsPortGroups(dvsList);

        // create an array of observables for DVS host entries
        const dvsHostsObs: Observable<ResourceBasicInfo[]>[] = this.getDvsHostsEntries(dvsList);
        const nsxtHostsObs: Observable<ResourceBasicInfo[]>[] = this.getDvsHostsEntries(nsxtNetworks);
        const dcHostsObs: Observable<ResourceBasicInfo[]>[] = this.getDvsHostsEntries(dcNetworks);
        // zip all observables
        const allDvs = Observable.zip.apply(null, dvsObs);
        const allDvsHosts = Observable.zip.apply(null, dvsHostsObs);
        let allnsxtHosts = Observable.of([]);
        if (nsxtHostsObs && nsxtHostsObs.length > 1) {
          allnsxtHosts = Observable.zip.apply(null, nsxtHostsObs);
        }
        const alldcHosts = Observable.zip.apply(null, dcHostsObs);

        // if the selected resource is a Cluster we need to fetch it hosts in order to validate if some of them is connected to the vds.
        const allClusterChilds: Observable<ComputeResource[]> = resourceObjIsCluster ?
          this.getHostsFromComputeResource(resourceObj) : Observable.of([]);

        // process the results from the zipped observables wherein only DV port group entries
        // whose parent distributed virtual switch can be accessed by the specified compute resource should be taken
        return Observable.combineLatest(allClusterChilds, allDvs, allDvsHosts, allnsxtHosts, alldcHosts)
          .map(([clusterChilds, dvs, dvsHosts, nsxtHosts, dcHosts]) => {
            let results = [];
            let portGroups = [], hosts = [];
            portGroups = portGroups.concat(dvs, nsxtNetworks, dcNetworks);
            hosts = hosts.concat(dvsHosts, nsxtHosts, dcHosts);
            for (let index = 0; index < hosts.length; index++) {
              if (resourceObjIsCluster) {
                // if the selected resource is a Cluster we need to validate if any of it hosts is connected to the vds.
                const clusterChildsHosts = clusterChilds.map(host => host['value']);
                if (hosts[index].some(host => clusterChildsHosts.indexOf(host['value']) !== -1)) {
                  results = results.concat(portGroups[index]);
                }
              } else {
                // if the selected resource is a not Cluster we validate if the selected host is connected to the vds.
                if (hosts[index].some(host => host['value'] === getMorIdFromObjRef(resourceObj.objRef))) {
                  results = results.concat(portGroups[index]);
                }
              }
            }
            return flattenArray(results.filter(v => v.spriteCssClass !== 'vsphere-icon-uplink-port-group'));
          });
      });
  }

  /**
   * Get the IP address of the newest VIC appliance
   */
  public getVicApplianceIp(): Observable<string> {
    return this.getAppliance()
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

  /**
   * Recursively queries the H5 Client for a datacenter associated with the resource
   * @param resourceObjRef
   */
  getDatacenterForResource(resourceObjRef: string) {
    if (resourceObjRef.split(':')[2] === 'Datacenter') {
      return this.http.get(`/ui/data/properties/${resourceObjRef}?properties=name`)
        .catch(e => Observable.throw(e))
        .map(response => response.json())
    } else {
      return this.http.get(`/ui/data/properties/${resourceObjRef}?properties=parent`)
        .catch(e => Observable.throw(e))
        .map(response => response.json())
        .switchMap((response) => {
          if (typeof response.parent === 'object') {
            return this.getDatacenterForResource(
              `urn:vmomi:${response.parent.type}:${response.parent.value}:${response.parent.serverGuid}`
            );
          }
          return Observable.throw(`Error getting Datacenter for resource '${resourceObjRef}'`);
        });
    }
  }
}
