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
  VIC_APPLIANCE_PORT
} from '../shared/constants/index';
import { GlobalsService } from '../shared/index';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  getServerInfoByVchObjRef
} from '../shared/utils/object-reference';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {VirtualContainerHost} from '../vch-view/vch.model';
import {CreateVchWizardService} from '../create-vch-wizard/create-vch-wizard.service';
import {Vch} from '../interfaces/vch';
import {ComputeResource} from '../interfaces/compute.resource';
import {ServerInfo} from '../shared/vSphereClientSdkTypes';

export interface ComputeResourceWithChilds {
  computeResource: ComputeResource;
  childComputeResources: ComputeResource[]
}

export interface SelectedComputeResourceInfo {
  path: string;
  datacenterObj: ComputeResource;
  obj: ComputeResource;
}

@Injectable()
export class ConfigureVchService {

  constructor(private httpClient: HttpClient,
              private createVchWizardService: CreateVchWizardService,
              private globalsService: GlobalsService) {
  }

  getServiceHostAndTkt(vch: VirtualContainerHost): Observable<any> {
    return Observable.combineLatest(
      this.createVchWizardService.getVicApplianceIp(),
      this.createVchWizardService.acquireCloneTicket(vch.id.split(':')[4]))
  }

  getVchId(vch: VirtualContainerHost): string {
    return vch.id.split(':')[3];
  }

  getVc(vch: VirtualContainerHost): ServerInfo {
    return  getServerInfoByVchObjRef(
      this.globalsService.getWebPlatform().getUserSession().serversInfo,
      vch
    );
  }

  getVchInfo(vchIdStr: string): Observable<Vch> {
    const vch = <VirtualContainerHost>{id: vchIdStr};
    return this.getServiceHostAndTkt(vch)
      .switchMap(([serviceHost, cloneTicket]) => {
        const vc = this.getVc(vch);
        const targetHostname = vc ? vc.name : null;
        const targetThumbprint = vc ? vc.thumbprint : null;
        const baseUrl = `https://${serviceHost}:${VIC_APPLIANCE_PORT}`;
        const url = `${baseUrl}/container/target/${targetHostname}/vch/${this.getVchId(vch)}?thumbprint=${targetThumbprint}`;
        const headers  = new HttpHeaders({
          'Content-Type': 'application/json',
          'X-VMWARE-TICKET': cloneTicket
        });

        return this.httpClient.get<Vch>(url, { headers: headers })
      });
  }

  patchVch(vchIdStr: string, payload: Vch): Observable<Vch> {
    const vch = <VirtualContainerHost>{id: vchIdStr};
    return this.getServiceHostAndTkt(vch)
      .switchMap(([serviceHost, cloneTicket]) => {
        const vc = this.getVc(vch);
        const targetHostname = vc ? vc.name : null;
        const targetThumbprint = vc ? vc.thumbprint : null;
        const baseUrl = `https://${serviceHost}:${VIC_APPLIANCE_PORT}`;
        const url = `${baseUrl}/container/target/${targetHostname}/vch/${this.getVchId(vch)}?thumbprint=${targetThumbprint}`;
        const headers  = new HttpHeaders({
          'Content-Type': 'application/merge-patch+json',
          'X-VMWARE-TICKET': cloneTicket
        });

        return this.httpClient.patch<Vch>(url, payload, {headers: headers})
      });
  }

  getHostsAndResourcePoolsFromComputeResource(computeResourceSources: ComputeResource[]):
    Observable<ComputeResourceWithChilds[]> {
      return Observable.from(computeResourceSources)
        .concatMap((cr: ComputeResource) => {
          if (!cr['hasChildren']) {
            return Observable.of(null);
          }
          return this.httpClient
            .get<ComputeResource[]>(`/ui/tree/children?nodeTypeId=${cr.nodeTypeId}&objRef=${cr.objRef}&treeId=DcHostsAndClustersTree`)
            .map((childComputeResources: ComputeResource[]) => ({computeResource: cr, childComputeResources: childComputeResources}))
        })
        .toArray();
  }

  loadSelectedComputeResourceInfo(serverInfos: ServerInfo[], resourceId: string): Observable<SelectedComputeResourceInfo> {
    return Observable.from(serverInfos)
      .concatMap((serverInfo: ServerInfo) => {
        return this.createVchWizardService.getClustersList(serverInfo.serviceGuid)
          .switchMap((resources: ComputeResource[]) => {
            return this.getHostsAndResourcePoolsFromComputeResource(resources)
              .switchMap((clustersWithHostsAndRP: ComputeResourceWithChilds[]) => {
                const selectedComputeResourcePath: ComputeResourceWithChilds = clustersWithHostsAndRP
                  .find(clustersWithHostsAndRPItem =>
                    clustersWithHostsAndRPItem.childComputeResources
                      .some(computeResource => computeResource.objRef
                        .split(':')[3] === resourceId));
                const resourceName: string = selectedComputeResourcePath.computeResource.text;
                const resourceChildName: string = selectedComputeResourcePath.childComputeResources
                  .find(clustersWithHostsAndRPItem => clustersWithHostsAndRPItem.objRef
                    .split(':')[3] === resourceId).text;
                return this.createVchWizardService.getDatacenterForResource(selectedComputeResourcePath.computeResource.objRef)
                  .map(dc => {
                    return {
                      path: `${serverInfo.name}/${dc['name']}/${resourceName}/${resourceChildName}`,
                      datacenterObj: dc,
                      obj: selectedComputeResourcePath.computeResource
                    }
                  });
              })
          })
      })
      .catch(error => {
        console.error(`Resource with id: ${resourceId} was not found`);
        return Observable.of({
          path: resourceId,
          datacenterObj: null,
          obj: null
        })
      });
  }

}
