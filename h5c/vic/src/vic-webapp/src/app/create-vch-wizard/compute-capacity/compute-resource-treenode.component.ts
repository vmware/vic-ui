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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CreateVchWizardService } from '../create-vch-wizard.service';
import { Observable } from 'rxjs/Observable';

export interface ComputeResource {
  text: string;
  nodeTypeId: string;
  objRef: string;
  aliases: string[];
}

@Component({
  selector: 'vic-compute-resource-treenode',
  styleUrls: ['./compute-capacity.scss'],
  template: `
  <ng-template [clrIfExpanded]="false">
    <ng-container>
      <!-- cluster and clusterhostsystems -->
      <clr-tree-node *ngFor="let cluster of clusters"
                     [clrLoading]="loading">
        <button class="clr-treenode-link cc-resource"
                [class.active]="selectedResourceObj && selectedResourceObj.objRef === cluster['objRef']"
                (click)="select(cluster)">
          <clr-icon shape="cluster"></clr-icon>
          {{ cluster['text'] }}
        </button>

        <ng-template [clrIfExpanded]="false">
          <ng-container>
            <clr-tree-node *ngFor="let clHost of clusterHostSystemsMap[cluster.objRef]">
              <button class="clr-treenode-link cc-resource"
                      [class.active]="selectedResourceObj && selectedResourceObj.objRef === clHost['objRef']"
                      (click)="select(clHost, cluster)">
                <clr-icon shape="host"></clr-icon>
                {{ clHost['text'] }}
              </button>
            </clr-tree-node>
          </ng-container>
        </ng-template>
      </clr-tree-node>

      <!-- standalone hosts -->
      <clr-tree-node *ngFor="let host of standaloneHosts">
        <button class="clr-treenode-link cc-resource"
                [class.active]="selectedResourceObj && selectedResourceObj.objRef === host['objRef']"
                (click)="select(host)">
          <clr-icon shape="host"></clr-icon>
          {{ host['text'] }}
        </button>
      </clr-tree-node>
    </ng-container>
  </ng-template>
  `
})
export class ComputeResourceTreenodeComponent implements OnInit {
  @Input() datacenter: ComputeResource;
  public loading = true;
  public clusters: ComputeResource[];
  public clusterHostSystemsMap: {[clusterRef: string]: ComputeResource[]} = {};
  public standaloneHosts: ComputeResource[];
  public selectedResourceObj: ComputeResource;
  @Output() resourceSelected: EventEmitter<{
    obj: ComputeResource,
    parentClusterObj?: ComputeResource,
    datacenterObj: ComputeResource
  }>;

  constructor(
    private createWzService: CreateVchWizardService
  ) {
    this.resourceSelected = new EventEmitter<{
      obj: ComputeResource,
      parentClusterObj?: ComputeResource,
      datacenterObj: ComputeResource
    }>();
  }

  ngOnInit() {
    this.loadClusters(this.datacenter);
  }

  loadClusters(dc: ComputeResource) {
    this.loading = true;
    this.createWzService
      .getClustersList()
      .subscribe(val => {
        this.clusters = val.filter(v => v.nodeTypeId === 'DcCluster');
        this.standaloneHosts = val.filter(v => v.nodeTypeId === 'DcStandaloneHost');

        // TODO: move these to service
        const clusterHostsObs = Observable.from(this.clusters)
          .concatMap((cluster: ComputeResource) => {
            return this.createWzService.getHostsAndResourcePools(cluster.objRef);
          });

        clusterHostsObs
          .subscribe(clusterHostSystems => {
            // since we use concatMap the order in which we get results is guaranteed
            for (let i = 0; i < this.clusters.length; i++) {
              this.clusterHostSystemsMap[this.clusters[i].objRef] = clusterHostSystems;
            }
            this.loading = false;
          });
      });
  }

  select(obj: ComputeResource, clusterObj?: ComputeResource) {
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
  }
}
