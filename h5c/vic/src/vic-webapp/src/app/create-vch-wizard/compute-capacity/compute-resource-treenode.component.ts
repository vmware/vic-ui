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
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChildren,
  QueryList,
  ElementRef,
  Renderer
} from '@angular/core';
import { DC_CLUSTER, DC_STANDALONE_HOST } from '../../shared/constants';

import { CreateVchWizardService } from '../create-vch-wizard.service';
import { Observable } from 'rxjs/Observable';
import { GlobalsService } from '../../shared';
import { ComputeResource } from '../../interfaces/compute.resource';
import { ServerInfo } from '../../shared/vSphereClientSdkTypes';

/**
 * Component that renders a tree view of the inventory items on the selected Datacenter
 * where Clusters, ClusterHostSystems and sstandalone hosts are displayed and selectable
 */

@Component({
  selector: 'vic-compute-resource-treenode',
  styleUrls: ['./compute-capacity.scss'],
  templateUrl: './compute-resource-treenode.template.html'
})
export class ComputeResourceTreenodeComponent implements OnInit {
  public loading = true;
  public clusters: ComputeResource[];
  public clusterHostSystemsMap: {[clusterRef: string]: ComputeResource[]} = {};
  public standaloneHosts: ComputeResource[];
  public selectedResourceObj: ComputeResource;
  @Input() serverInfo: ServerInfo;
  @Input() datacenter: ComputeResource;
  @Output() resourceSelected: EventEmitter<{
    obj: ComputeResource,
    parentClusterObj?: ComputeResource,
    datacenterObj: ComputeResource
  }>;

  @ViewChildren('btnEl') computeResourceBtns: QueryList<any>;

  constructor(
    private createWzService: CreateVchWizardService,
    private renderer: Renderer,
    private globalsService: GlobalsService
  ) {
    this.resourceSelected = new EventEmitter<{
      obj: ComputeResource,
      parentClusterObj?: ComputeResource,
      datacenterObj: ComputeResource
    }>();
  }

  ngOnInit() {
    this.loadClusters(this.serverInfo);
  }

  loadClusters(serverInfo: ServerInfo) {
    this.loading = true;
    this.createWzService
      .getClustersList(serverInfo.serviceGuid)
      .subscribe(val => {
        // const filteredByDc = val.filter(v => v['datacenterObjRef'] === dc.objRef);
        this.clusters = val.filter(v => v.nodeTypeId === DC_CLUSTER);
        this.standaloneHosts = val.filter(v => v.nodeTypeId === DC_STANDALONE_HOST);

        if (!this.clusters.length) {
          this.loading = false;
        }

        // pointer to the current cluster object
        // since we use concatMap the order in which we get results is guaranteed
        let idx = 0;
        this.createWzService.getAllClusterHostSystems(this.clusters)
          .subscribe(clusterHostSystems => {
            // if this is the last emission set loading var to false
            if (idx === this.clusters.length - 1) {
              this.loading = false;
            }

            // no host is attached to the cluster. at this point it does not make sense
            // to display the cluster to the user, and trying to utilize the empty cluster
            // would surely cause an error, so it makes sense to remove the cluster node from view
            if (!clusterHostSystems.length) {
              this.clusters[idx].isEmpty = true;
              idx++;
              return;
            }

            this.clusterHostSystemsMap[this.clusters[idx].objRef] = clusterHostSystems;
            idx++;
          });
      });
  }

  selectResource(event: Event, obj: ComputeResource, clusterObj?: ComputeResource) {
    this.selectedResourceObj = obj;
    if (clusterObj) {
      this.resourceSelected.emit({
        obj: obj,
        parentClusterObj: clusterObj,
        datacenterObj: this.datacenter
      });
    } else {
      this.resourceSelected.emit({ obj: obj, datacenterObj: this.datacenter });
    }

    this.unselectComputeResource();
    this.renderer.setElementClass(event.target, 'active', true);
  }

  unselectComputeResource() {
    this.computeResourceBtns.forEach((elRef: ElementRef) => {
      this.renderer.setElementClass(elRef.nativeElement, 'active', false);
    })
  }
}
