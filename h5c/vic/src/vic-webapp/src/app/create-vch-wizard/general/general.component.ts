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
import {Component, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {VchGeneralModel, VchGeneralComponent} from '../../shared/components/vch-general.component';

@Component({
  selector: 'vic-vch-creation-general',
  templateUrl: './general.html',
  styleUrls: ['./general.scss']
})
export class VchCreationWizardGeneralComponent {
  model: VchGeneralModel = {
    name: 'virtual-container-host',
    containerNameConvention: '',
    debug: 0,
    syslogAddress: ''
  };
  vicApplianceIp: string;
  @ViewChild('component') component: VchGeneralComponent;

  constructor(private createWzService: CreateVchWizardService) { }

  onPageLoad() { }

  /**
   * Async validation for the Name section
   * This calls the VchCreationWizardService to check if the provided name
   * is unique among VirtualApps and ResourcePools on VC and then returns
   * an observable of the name or any error
   * @returns {Observable<any>}
   */
  onCommit(): Observable<any> {
    return Observable
      .zip(
        this.createWzService.getVicApplianceIp(),
        this.createWzService.checkVchNameUniqueness(this.component.form.get('name').value)
      )
      .catch(err => {
        // if any failure occurrs, unset the vicApplianceIp var
        this.vicApplianceIp = null;
        return Observable.throw(err);
      })
      .switchMap((arr) => {
        this.vicApplianceIp = arr[0];

        const isUnique = arr[1];
        if (!isUnique) {
          this.component.form.get('name').setErrors({
            resourcePoolExists: true
          });
          return Observable.throw(
            ['There is already a VirtualApp or ResourcePool that exists with the same name']);
        }

        return Observable.of({general: this.component.model});
      });
  }
}
