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
  public log: string;
  public loading = false;
  @Input() vch: VirtualContainerHost;

  constructor(
    private formBuilder: FormBuilder,
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
    Observable.combineLatest(
      this.createWzService.getVicApplianceIp(),
      this.createWzService.acquireCloneTicket()
    ).catch(err => {
      return Observable.throw(err);
    }).subscribe(([serviceHost, cloneTicket]) => {
      const vchId = this.vch.id.split(':')[3];
      const servicePort = VIC_APPLIANCE_PORT;
      const targetHost = this.extSessionService.getVcenterServersInfo()[0];
      const targetHostname = targetHost.name;
      const targetThumbprint = targetHost.thumbprint;
      const url =
        `https://${serviceHost}:${servicePort}/container/target/${targetHostname}/vch/${vchId}/log?thumbprint=${targetThumbprint}`;

      const headers  = new Headers({
        'Content-Type': 'application/json',
        'X-VMWARE-TICKET': cloneTicket
      });

      const options  = new RequestOptions({ headers: headers });
      this.http.get(url, options)
        .map(response => response.text())
        .subscribe(response => {
          this.log = response;
          this.loading = false;
        }, error => {
          this.log = error.message || 'Error loading VCH log!';
          this.loading = false;
        });
    });
  }
}
