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

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Headers, Http, RequestOptions } from '@angular/http';

import { CreateVchWizardService } from '../../create-vch-wizard/create-vch-wizard.service';
import { ExtendedUserSessionService } from '../../services/extended-usersession.service';
import { GlobalsService } from '../../shared';
import { Observable } from 'rxjs/Observable';
import { VIC_APPLIANCE_PORT } from '../../shared/constants/create-vch-wizard';
import { VirtualContainerHost } from '../vch.model';

@Component({
  selector: 'vic-vch-log-view',
  styleUrls: ['./vch-log-view.scss'],
  templateUrl: './vch-log-view.template.html'
})
export class VicVchLogViewComponent implements OnInit {
  public form: FormGroup;
  public log: '';
  public loading = false;
  @Input() vch: VirtualContainerHost;

  constructor(
    private formBuilder: FormBuilder,
    private globalsService: GlobalsService,
    private http: Http,
    private createWzService: CreateVchWizardService,
    private extSessionService: ExtendedUserSessionService
  ) {
    this.form = formBuilder.group({
      enableSSH: false
    });
  }

  ngOnInit() {
    this.loading = true;
    Observable.zip(
      this.createWzService.getVicApplianceIp(),
      this.createWzService.acquireCloneTicket()
    ).catch(err => {
      console.error(err);
      return Observable.throw(err);
    }).subscribe(arr => {
      const serviceHost = arr[0];
      const cloneTicket = arr[1];
      const vchId = this.vch.id.split(':')[3];
      const servicePort = VIC_APPLIANCE_PORT;
      const targetHost = this.extSessionService.getVcenterServersInfo()[0];
      const targetHostname = targetHost.name;
      const targetThumbprint = targetHost.thumbprint;
      const url =
        `https://${serviceHost}:${servicePort}/container/target/${targetHostname}/vch/${vchId}/log?thumbprint=${targetThumbprint}`;

      console.log(url, cloneTicket);
      const headers  = new Headers({
        'Content-Type': 'application/json',
        'X-VMWARE-TICKET': cloneTicket
      });

      const options  = new RequestOptions({ headers: headers });
      this.http.get(url, options)
        .map(response => response.json())
        .subscribe(response => {
          console.log('success response:', response);
          this.log = response;
          this.loading = false;
        }, error => {
          console.error('error response:', error);
          this.log = error.message || 'Error loading VCH log!';
          this.loading = false;
        });
    });
  }
}
