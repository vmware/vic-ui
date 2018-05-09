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

import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

// TODO: refactor & clean up the template
@Component({
  selector: 'vic-vch-creation-summary',
  templateUrl: './summary.html',
  styleUrls: ['./summary.scss']
})
export class SummaryComponent {
  public cliPayload: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() payload: any;

  /**
   * On WizardPage load event, start listening for events on inputs
   */
  onPageLoad(): void {
    // refresh cli value based on any changes made to the previous pages
    this.cliPayload.next(this.payload);
  }

  /**
   * Emit the payload that will be sent to vic-machine API endpoint
   * @returns {Observable<any>}
   */
  onCommit(): Observable<any> {
    return Observable.of(this.payload);
  }
}
