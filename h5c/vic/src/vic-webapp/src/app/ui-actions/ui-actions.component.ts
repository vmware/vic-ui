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

import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {GlobalsService} from '../shared';

@Component({
  selector: 'vic-ui-actions',
  template: ''
})
export class UiActionsComponent implements OnInit {

  private params: any;

  constructor(
    private globalService: GlobalsService,
    private zone: NgZone,
    private router: ActivatedRoute
  ) { }

  /**
   * Launch the modal
   */
  ngOnInit() {
    this.router.params.subscribe(params => {
       this.params = params;
       this.globalService.getWebPlatform().sendNavigationRequest('com.vmware.vic.customtab-vch', 'urn:vic:vic:Root:vic%25252Fvic-root');
    });
    window.addEventListener('message', this.onMessage.bind(this), false);
  }

  /**
   * Window 'message' listener
   * @param event
   */
  onMessage(event: MessageEvent) {
    if (event.origin !== location.protocol + '//' + location.host) {
      return;
    }

    const data: any = event.data;

    if (data.eventType === 'vch-view.component.ngAfterViewInit') {
      this.zone.run(() => {
        const frames = window.parent.frames;
        for (let i = 0; i < frames.length; i++) {
          if (this.params && this.params.actionId === 'com.vmware.vic.createVch') {
            frames[i].postMessage({
              eventType: 'vch-view.component.launchCreateVchWizard'
            }, location.protocol + '//' + location.host);
          } else if (this.params && this.params.actionId === 'com.vmware.vic.deleteVch') {
            frames[i].postMessage({
              eventType: 'vch-view.component.launchDeleteVchModal',
              payload: {id: this.params.objectId}
            }, location.protocol + '//' + location.host);
          }
        }
      });
      this.globalService.getWebPlatform().closeDialog();
    }
  }
}
