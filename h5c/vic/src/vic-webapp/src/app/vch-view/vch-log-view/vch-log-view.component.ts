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
import { Observable, of, combineLatest, throwError as observableThrowError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { VIC_APPLIANCE_PORT } from '../../shared/constants/create-vch-wizard';
import { VirtualContainerHost } from '../vch.model';
import { getServerInfoByVchObjRef } from '../../shared/utils/object-reference';
import { GlobalsService } from '../../shared';

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
    private globalsService: GlobalsService
  ) {
    this.form = formBuilder.group({
      enableSSH: false
    });
  }

  ngOnInit() {
    this.loading = true;
    combineLatest(
      this.createWzService.getVicApplianceIp(),
      this.createWzService.acquireCloneTicket(this.vch.id.split(':')[4]),
      this.createWzService.getDatacenterForResource(this.vch.id)
  ).pipe(catchError(err => {
      return observableThrowError(err);
    })).subscribe(([serviceHost, cloneTicket, datacenter]) => {
      const vchId = this.vch.id.split(':')[3];
      const servicePort = VIC_APPLIANCE_PORT;
      const vc = getServerInfoByVchObjRef(
        this.globalsService.getWebPlatform().getUserSession().serversInfo,
        this.vch
      );

      const targetHostname = vc ? vc.name : null;
      const targetThumbprint = vc ? vc.thumbprint : null;
      const targetDatacenter = datacenter.id.split(':')[3];
      const url =
        `https://${serviceHost}:${servicePort}/container/target/${targetHostname}/datacenter/${targetDatacenter}` +
        `/vch/${vchId}/log?thumbprint=${targetThumbprint}`;

      const headers  = new Headers({
        'Content-Type': 'application/json',
        'X-VMWARE-TICKET': cloneTicket
      });

      const options  = new RequestOptions({ headers: headers });
      this.http.get(url, options)
        .pipe(catchError(error => of(error)))
        .pipe(map(response => response.text()))
        .subscribe(response => {
          this.log = response;
          this.loading = false;
        });
    });
  }
}
