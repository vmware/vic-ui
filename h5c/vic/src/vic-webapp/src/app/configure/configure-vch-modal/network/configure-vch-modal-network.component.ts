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

import {Component, OnInit} from '@angular/core';
import {ConfigureVchService, SelectedComputeResourceInfo} from '../../configure-vch.service';
import {GlobalsService} from '../../../shared/globals.service';
import {ConfigureVchBase} from '../../configure-vch-base';
import {ActivatedRoute} from '@angular/router';
import {globalProperties} from '../../../../environments/properties';
import {VchView} from '../../../interfaces/vch';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'vic-configure-vch-modal-network',
  styleUrls: ['./configure-vch-modal-network.component.scss'],
  templateUrl: './configure-vch-modal-network.component.html'
})

export class ConfigureVchModalNetworkComponent extends ConfigureVchBase implements OnInit {

  public helpLink = globalProperties.vhcDocsGeneral;
  public resourceObjRefObs: Observable<{vchUIModel: VchView, resourceInfo: SelectedComputeResourceInfo}>;

  constructor(protected globalsService: GlobalsService,
              protected configureVchService: ConfigureVchService,
              protected activatedRoute: ActivatedRoute) {
    super(globalsService, configureVchService, activatedRoute);
  }

  ngOnInit() {
    super.ngOnInit();

    const serversInfo = this.globalsService
      .getWebPlatform()
      .getUserSession()
      .serversInfo;

    this.resourceObjRefObs = this.vchInfo
      .switchMap((vchInfo: VchView) => {
        return this.configureVchService
          .loadSelectedComputeResourceInfo(serversInfo, vchInfo.computeCapacity.computeResource)
          .map((resourceInfo: SelectedComputeResourceInfo) => {
            resourceInfo.datacenterObj.objRef = resourceInfo.datacenterObj['id'];
            return resourceInfo;
          })
          .map((resourceInfo: SelectedComputeResourceInfo) => ({vchUIModel: vchInfo, resourceInfo: resourceInfo}))
      })
  }

}
