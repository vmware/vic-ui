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
import { Observable, zip, timer, of, from, combineLatest, throwError, forkJoin} from 'rxjs';
import { map, mergeAll, mergeMap, concat, catchError,
  publishReplay, refCount, take, switchMap, concatMap, tap, toArray} from 'rxjs/operators';
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
      .pipe(publishReplay(1, 2000))
      .pipe(refCount())
      .pipe(take(1))
      .pipe(catchError(err => throwError(err)))
      .pipe(map(response => response.json()));
  }

  getAppliance() {
    return this._appliance;
  }

  getClusterConfiguration(objRef: string): Observable<any[]> {
    const url = `/ui/data/properties/${objRef}?properties=configuration`;
    return this.http.get(url)
      .pipe(catchError(e => throwError(e)))
      .pipe(map(response => response.json()));
  }

  getClusterDrsStatus(objRef: string): Observable<boolean> {
    return this.getClusterConfiguration(objRef)
      .pipe(map(response => {
        return response['configuration']['drsConfig']['enabled'];
      }))
  }

  getClusterVMGroups(objRef: string): Observable<any[]> {
    const url = `/ui/data/properties/${objRef}?properties=ClusterComputeResource/configurationEx/group`;
    return this.http.get(url)
      .pipe(catchError(e => throwError(e)))
      .pipe(map(response => response.json()));
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
      .pipe(catchError(e => throwError(e)))
      .pipe(map(response => response.json()))
      .pipe(catchError(e => throwError(e)));
  }

  /**
   * Gets a clone ticket from vSphere api to be passed to vic-machine-server
   * @returns {Observable<string>} Observable containing the clone ticket
   */
  acquireCloneTicket(serviceGuid: string): Observable<string> {
    const params = new URLSearchParams();
    params.set('serviceGuid', serviceGuid);
    return this.http.post(GET_CLONE_TICKET_URL, params)
      .pipe(catchError(e => throwError(e)))
      .pipe(map(response => response.text()))
      .pipe(catchError(e => throwError(e)));
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
      .pipe(map(resourceCompleteInfo => {
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
      }))
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
      return infoListObs.length > 0 ? zip(...infoListObs) : of([]);
    } else {
      return of([]);
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
      .pipe(switchMap(data => {
          const results = data['childEntity'];
          const folderEntities = results.filter(result => result && result.type === 'Folder');
          const dcEntities = results.filter(result => result && result.type === 'Datacenter');
          const nestedDcEntities = this.getDcUnderFolder(of(folderEntities));
          return nestedDcEntities.pipe(switchMap( result => {
            let resultEntities;
            resultEntities = flattenArray(result);
            return this.getResourcesCompleteInfo(resultEntities.concat(dcEntities))
          } ))
        }));
  }

  getDcUnderFolder(entitiesObs: Observable <any[]>): Observable<any[]> {
    return entitiesObs.pipe(switchMap( entities => {
       if (entities && entities.length > 0) {
         const entitiObs = entities.map(data => {
          if (data && data.type === 'Folder') {
            const url = `${globalProperties.vicService.paths.properties}urn:vmomi:` +
            `${data.type}:${data.value}:${data.serverGuid}?properties=childEntity`;
            const childEntityObservable = this.http.get(url)
              .pipe(catchError(e => throwError(e)))
              .pipe(map(response => response.json()))
              .pipe(map(response => response['childEntity']));
            return this.getDcUnderFolder(childEntityObservable);
          } else if (data && data.type === 'Datacenter') {
            return of(data);
          } else {
            return of([]);
          }
        });
        return forkJoin(...entitiObs);
       } else {
         return of([]);
       }
      }))
    }

  /**
   * Queries the H5 Client for Clusters and stand alone Hosts from the desired DC
   */
  getDcClustersAndStandAloneHosts(dcObj: ComputeResource): Observable<ComputeResource[]> {
    const props = 'host,cluster';
    return this.getResourceProperties<{ host: ResourceBasicInfo[]; cluster: ResourceBasicInfo[] }>(dcObj.objRef, props)
      .pipe(map(data => {
        if (data['cluster']) {
          return {
            childResources: data['cluster'].concat(data['host'])
          }
        } else {
          return {
            childResources: data['host']
          }
        }
      }))
      .pipe(switchMap(basicData => {
        return this.getResourcesCompleteInfo(basicData.childResources)
          .pipe(switchMap((completeData: ComputeResource[]) => {

            const clusters: ComputeResource[] = completeData
              .filter((rci: ComputeResource) => resourceIsCluster(rci.type));

            const standAloneHosts: ComputeResource[] = completeData
              .filter((rci: ComputeResource) => resourceIsHost(rci.type) && (!rci.parent || !resourceIsCluster(rci.parent.type)));

            if (standAloneHosts.length > 0) {
              // if we have stand alone Hosts, we want to fetch also its childs (resource pool tree)
              const standAloneHostsWithChilds: Observable<ComputeResource>[] = standAloneHosts.map(host => {
                return this.getResourcePoolsTree(host.aliases[0], host)
                  .pipe(map(resourcePoolTreeList => {
                    host.childs = resourcePoolTreeList;
                    return host;
                  }))
              });
              return zip(...standAloneHostsWithChilds)
                .pipe(map(hostsWithChilds => {
                  return clusters.concat(hostsWithChilds)
                }));

            } else {
              // if we don't have stand alone Host, we only return Cluster list
              return of(clusters);
            }
          }))
      }))
      .pipe(map((list: ComputeResource[]) => {
        // sets the reference to the DC object for each Cluster and stand alone Host
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = dcObj);
        return list;
      }))
  }

  /**
   * Gets a nested tree of ResourcePools.
   * @param {string} parentResourcePoolRef
   * @param {ComputeResource} rootParentComputeResource
   * @returns {Observable<ComputeResource[]>}
   */
  getResourcePoolsTree(parentResourcePoolRef: string, rootParentComputeResource: ComputeResource = null): Observable<ComputeResource[]> {
    return this.getResourceProperties<{ resourcePool: ResourceBasicInfo[] }>(parentResourcePoolRef, 'resourcePool')
      .pipe(map(data => data['resourcePool'] ? data['resourcePool'] : []))
      .pipe(switchMap(data => data.length > 0 ? this.getResourcesCompleteInfo(data) : of([])))
      .pipe(map((list: ComputeResource[]) => {
        // sets the reference to the Cluster object for each Host and ResourcePool
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = rootParentComputeResource);
        return list;
      }))
      .pipe(switchMap((resourcePoolList: ComputeResource[]) => {
        const resourcePoolListObs = resourcePoolList.map((resPool: ComputeResource) => {
          return this.getResourcePoolsTree(resPool.objRef, rootParentComputeResource)
            .pipe(map((childResPool: ComputeResource[]) => {
              resPool.childs = childResPool.length > 0 ? childResPool : [];
              return resPool;
            }))
        });

        return resourcePoolListObs.length > 0 ? zip(...resourcePoolListObs) : of([]);
      }))
  }

  /**
   * Queries the H5 Client for hosts, and resourcepools
   * for the given cluster object id
   */
  getHostsAndResourcePoolsFromCluster(cluster: ComputeResource): Observable<ComputeResource[]> {
    return this.getResourceProperties<{ host: ResourceBasicInfo[] }>(cluster.objRef, 'host')
      .pipe(switchMap(hostAndRootResPool => {
        const hosts: ResourceBasicInfo[] = hostAndRootResPool['host'] ? hostAndRootResPool['host'] : [];
        // const rootResPool: ResourceBasicInfo = hostAndRootResPool['resourcePool'];
        // const rootResPoolRef: string = `urn:vmomi:ResourcePool:${rootResPool.value}:${rootResPool.serverGuid}`;
        return this.getResourcePoolsTree(cluster.aliases[0], cluster)
          .pipe(map(resPoolList => {
            return { childResources: hosts.concat(resPoolList) };
          }))
      }))
      .pipe(switchMap(data => this.getResourcesCompleteInfo(data.childResources)))
      .pipe(map((list: ComputeResource[]) => {
        // sets the reference to the Cluster object for each Host and ResourcePool
        list.forEach((obj: ComputeResource) => obj.rootParentComputeResource = cluster);
        return list;
      }))
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
      .pipe(map(vchsInfo => {
        const vchsRPNames: string[] = vchsInfo
          .filter(vch => resourceIsResourcePool(vch.parentType))
          .map(vch => vch.parentValue);
        return vchsRPNames;
      }))
  }

  /**
   * Queries the H5 Client for ClusterHostSystems for all DcClusters
   * @param clusters
   */
  getHostsAndResourcePoolsFromClusters(clusters: ComputeResource[]): Observable<ComputeResource[]> {
    return from(clusters)
      .pipe(concatMap((cluster: ComputeResource) => {
        return this.getHostsAndResourcePoolsFromCluster(cluster);
      }));
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
        .pipe(catchError(e => throwError(e)))
        .pipe(map(response => {
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

        }));
    } else {
      // host
      return this.getResourceProperties<{ systemResources: any }>(resourceObjId, 'systemResources')
        .pipe(catchError(e => throwError(e)))
        .pipe(map(response => {
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
        }));
    }

  }

  getDatastores(resourceObjRef: string): Observable<any[]> {
    return this.http.get('/ui/data/properties/' +
      `${resourceObjRef}?properties=datastore`)
      .pipe(catchError(e => throwError(e)))
      .pipe(map(response => response.json()))
      .pipe(catchError(e => throwError(e)))
      .pipe(switchMap(response => {
        if (!response.hasOwnProperty('datastore') || response['datastore'] === null) {
          return of([]);
        }

        const refs = response['datastore'].map(ref => {
          return `urn:vmomi:Datastore:${ref['value']}:${ref['serverGuid']}`;
        });
        const obsArray = refs.map(objRef => {
          return this.http.get('/ui/data/properties/' +
            `${objRef}?properties=name,info,overallStatus`)
            .pipe(catchError(e => throwError(e)))
            .pipe(map(rsp => rsp.json()))
            .pipe(tap(rsp => {
              rsp['info']['freeSpace'] = byteToLegibleUnit(rsp['info']['freeSpace']);
            }))
            .pipe(catchError(e => throwError(e)));
        });
        return zip.apply(null, obsArray);
      }));
  }

  getNetworkingTree(dcObj: ComputeResource): Observable<any[]> {
   return this.http.get('/ui/data/properties/urn:vmomi:Datacenter:' +
            `${dcObj['value']}:${dcObj['serverGuid']}?properties=network`)
            .pipe(map(response => response.json()))
            .pipe(map(response => response.network));
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
        .pipe(map(response => response.json()));
    });
  }

  /**
   * Returns all the host contained in a ComputeResource Object (eg: Cluster)
   * @param {ComputeResource} obj
   * @returns {Observable<ResourceBasicInfo[]>}
   */
  getHostsFromComputeResource(obj: ComputeResource): Observable<ResourceBasicInfo[]> {
    return this.getResourceProperties(obj.objRef, 'host')
      .pipe(map(data => data['host'] ? data['host'] : []));
  }

  /**
   * Get all available portgroups for the selected compute resource
   * @param dcObj selected datacenter object
   * @param resourceObj the selected compute resource
   */
  getDistributedPortGroups(dcObj: ComputeResource, resourceObj: ComputeResource): Observable<any> {
    const resourceObjIsCluster = resourceIsCluster(resourceObj.type);
    return this.getNetworkingTree(dcObj)
      .pipe(switchMap(networkList => {
        const allNetworkHostsObs = networkList.map(network => {
          return this.getNetworkingHosts(network)
          .pipe(map(hostObj => {
            network.text = hostObj.name;
            return hostObj.host;
          }));
        });

        // if the selected resource is a Cluster we need to fetch it hosts in order to validate if some of them is connected to the vds.
        const allClusterChilds: Observable<ComputeResource[]> = resourceObjIsCluster ?
          this.getHostsFromComputeResource(resourceObj) : of([]);

        // process the results from the zipped observables wherein only DV port group entries
        // whose parent distributed virtual switch can be accessed by the specified compute resource should be taken

        return combineLatest(allClusterChilds, of(networkList),  forkJoin(...allNetworkHostsObs))
          .pipe(map(([clusterChilds, networks, allNetworkHosts]) => {
            let results = [];
            allNetworkHosts.forEach((item, index) => {
              if (resourceObjIsCluster) {
                // if the selected resource is a Cluster we need to validate if any of it hosts is connected to the vds.
                const clusterChildsHosts = clusterChilds.map(host => host['value']);
                if (item.some(host => clusterChildsHosts.indexOf(host['value']) !== -1)) {
                  results = results.concat(networks[index]);
                }
              } else {
                // if the selected resource is a not Cluster we validate if the selected host is connected to the vds.
                if (item.some(host => host['value'] === getMorIdFromObjRef(resourceObj.objRef))) {
                  results = results.concat(networks[index]);
                }
              }
            });

            return flattenArray(results);
          }));
      }));
  }

  getNetworkingHosts(network: any): Observable <any> {
    return this.http.get(`/ui/data/properties/urn:vmomi:${network['type']}:${network['value']}:` +
    `${network['serverGuid']}?properties=host,name`)
    .pipe(map(response => response.json()));
  }

  /**
   * Get the IP address of the newest VIC appliance
   */
  public getVicApplianceIp(): Observable<string> {
    return this.getAppliance()
      .pipe(catchError(err => throwError(err)))
      .pipe(switchMap((list: string[]) => {
        if (!list || !list.length) {
          throw new Error('No VIC appliance was detected');
        }
        const splitByColon = list[0].split(':');
        const ipAddress = splitByColon[1].split(',')[1].trim();
        return of(ipAddress);
      }))
      .pipe(catchError(err => throwError(err)));
  }

  /**
   * Verify VIC Appliance VM is reachable and API server is communicatable with the browser
   */
  public verifyVicMachineApiEndpoint(): Observable<any | null> {
    return this.getVicApplianceIp()
      .pipe(catchError((err: Error) => {
        return throwError({
          type: 'vm_not_found'
        });
      }))
      .pipe(switchMap(ip => {
        return this.http.get(`https://${ip}:8443/container/hello`)
          .pipe(catchError((err: Response) => {
            console.error(err);
            // network error. details are not visible in the browser level
            // however, we are fairly confident in most cases that this is caused by the
            // self-signed SSL certificate being blocked by the browser
            if (err.status === 0) {
              return throwError({
                type: 'ssl_cert',
                payload: ip
              });
            }
            // handle http response status codes such as 404, 500, etc.
            return throwError({
              type: 'other',
              payload: err
            });
          }))
          .pipe(map(response => ip));
      }));
  }

  /**
   * Recursively queries the H5 Client for a datacenter associated with the resource
   * @param resourceObjRef
   */
  getDatacenterForResource(resourceObjRef: string) {
    if (resourceObjRef.split(':')[2] === 'Datacenter') {
      return this.http.get(`/ui/data/properties/${resourceObjRef}?properties=name`)
        .pipe(catchError(e => throwError(e)))
        .pipe(map(response => response.json()))
    } else {
      return this.http.get(`/ui/data/properties/${resourceObjRef}?properties=parent`)
        .pipe(catchError(e => throwError(e)))
        .pipe(map(response => response.json()))
        .pipe(switchMap((response) => {
          if (typeof response.parent === 'object') {
            return this.getDatacenterForResource(
              `urn:vmomi:${response.parent.type}:${response.parent.value}:${response.parent.serverGuid}`
            );
          }
          return throwError(`Error getting Datacenter for resource '${resourceObjRef}'`);
        }));
    }
  }
}
