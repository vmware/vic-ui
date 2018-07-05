import { VirtualContainerHost } from './../../vch-view/vch.model';
/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

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

import { ComputeResource } from './../../interfaces/compute.resource';
import { ServerInfo } from '../vSphereClientSdkTypes';
import { COMPUTE_RESOURCE_NODE_TYPES } from '../constants';
import {globalProperties} from '../../../environments/global-properties';

export function getServerServiceGuidFromObj (obj: ComputeResource): string {
  return obj.objRef.split(':')[4];
}

export function getServerThumbprintFromObj (serversInfo: ServerInfo[], obj: ComputeResource): string {
    const results = serversInfo.filter((item: ServerInfo) => {
      return item.serviceGuid === getServerServiceGuidFromObj(obj);
    });

    if (results.length) {
      return results[0].thumbprint;
    }
    return null;
}

export function getServerHostnameFromObj (serversInfo: ServerInfo[], obj: ComputeResource): string {
  const results = serversInfo.filter((item: ServerInfo) => {
    return item.serviceGuid === getServerServiceGuidFromObj(obj);
  });

  if (results.length) {
    return results[0].name;
  }
  return null;
}

export function getMorIdFromObjRef (objRef: string): string {
  return objRef.split(':')[3];
}

export function getServerInfoByVchObjRef (serversInfo: ServerInfo[], vch: VirtualContainerHost): ServerInfo {
  const idx = vch.id.lastIndexOf(':');
  const filtered = serversInfo.filter((item: ServerInfo) => {
    return item.serviceGuid === vch.id.substr(idx + 1);
  });
  return filtered[0] || null;
}

export function isDesiredType(type: string, types: string[]): boolean {
  return types.indexOf(type) !== -1;
}

export function resourceIsCluster(type: string): boolean {
  return isDesiredType(type, [
    COMPUTE_RESOURCE_NODE_TYPES.cluster.dc_cluster,
    COMPUTE_RESOURCE_NODE_TYPES.cluster.folder_cluster,
    COMPUTE_RESOURCE_NODE_TYPES.cluster.cluster_compute_resource
  ]);
}

export function resourceIsHost(type: string): boolean {
  return isDesiredType(type, [
    COMPUTE_RESOURCE_NODE_TYPES.host.dc_stand_alone,
    COMPUTE_RESOURCE_NODE_TYPES.host.cluster_host,
    COMPUTE_RESOURCE_NODE_TYPES.host.host_system
  ]);
}

export function resourceIsResourcePool(type: string): boolean {
  return isDesiredType(type, [
    COMPUTE_RESOURCE_NODE_TYPES.resource_pool.vic_vch_resource_pool,
    COMPUTE_RESOURCE_NODE_TYPES.resource_pool.resource_pool_resource_pool,
    COMPUTE_RESOURCE_NODE_TYPES.resource_pool.resource_pool,
    COMPUTE_RESOURCE_NODE_TYPES.resource_pool.cluster_resource_pool,
    COMPUTE_RESOURCE_NODE_TYPES.resource_pool.host_resource_pool
  ]);
}


