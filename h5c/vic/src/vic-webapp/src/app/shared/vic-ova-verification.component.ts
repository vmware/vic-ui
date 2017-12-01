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
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Based on the response from the API endpoint render errors if any
 * TODO: i18n
 */

@Component({
  selector: 'vic-ova-verification',
  template: `
  <clr-alert *ngIf="errorObj"
             [clrAlertType]="'danger'"
             [clrAlertClosable]="false">
    <clr-alert-item *ngIf="errorObj.type === ERR_TYPE_UNTRUSTED_CERT">
      <span class="alert-text">
        Failed to verify the vic-machine server at endpoint https://{{ errorObj.payload }}:8443. Possible causes:<br/>
        <ol>
          <li>The VIC appliance VM is running, but unreachable due to network misconfiguration.</li>
          <li>The VIC appliance VM is up, but the API endpoint is unreachable. Possible issues include, but are not limited to:
            <ul>
              <li>Network misconfiguration</li>
              <li>Firewall rules</li>
              <li>API endpoint is down</li>
            </ul>
          </li>
          <li>Your browser may be blocking the connection because of an untrusted certificate.
            <a href="https://{{ errorObj.payload }}:8443/container/hello" target="_blank">
            View API directly in your browser</a> to see if any warnings are presented.
          </li>
        </ol>
      </span>
      <div class="alert-actions">
        <a href="javascript://" (click)="verifyAppliance()">Refresh</a>
      </div>
    </clr-alert-item>
    <!-- vic appliance was not found -->
    <clr-alert-item *ngIf="errorObj.type === ERR_TYPE_VM_NOT_FOUND">
      <span class="alert-text">
        Could not find any VIC appliance VM
      </span>
    </clr-alert-item>
    <!-- other http failures -->
    <clr-alert-item *ngIf="errorObj.type === ERR_TYPE_OTHER">
      <span class="alert-text">
        {{ errorObj.payload }}
      </span>
    </clr-alert-item>
  </clr-alert>
  `
})
export class VicOvaVerificationComponent {
  @Input() errorObj: {type: string; payload: any};
  @Output() refreshEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  public readonly ERR_TYPE_VM_NOT_FOUND = 'vm_not_found';
  public readonly ERR_TYPE_UNTRUSTED_CERT = 'ssl_cert';
  public readonly ERR_TYPE_OTHER = 'other';

  verifyAppliance() {
    this.refreshEvent.emit(true);
  }
}
