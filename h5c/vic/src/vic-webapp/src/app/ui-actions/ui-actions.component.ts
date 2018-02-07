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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { GlobalsService } from '../shared';
import * as bus from 'framebus';

@Component({
  selector: 'vic-ui-actions',
  template: ''
})
export class UiActionsComponent implements OnInit {

  constructor(private globalService: GlobalsService,
              private router: ActivatedRoute) {
  }

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {

      /* Wait for VHC list to be ready */
      bus.on('vch-view.component.ngAfterViewInit', () => {
        if (params.actionId === 'com.vmware.vic.createVch') {
          bus.emit('vch-view.component.launchCreateVchWizard');
        } else if (params.actionId === 'com.vmware.vic.deleteVch') {
          bus.emit('vch-view.component.launchDeleteVchModal', {
            id: params.objectId
          });
        }
        this.globalService.getWebPlatform().closeDialog();
      });

      /* Navigate to VCH list */
      this.globalService
        .getWebPlatform()
        .sendNavigationRequest(
          'com.vmware.vic.customtab-vch',
          'urn:vic:vic:Root:vic%25252Fvic-root'
        );
    });
  }
}
