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
import { VirtualContainerHost } from '../vch.model';
import { Http, Headers, RequestOptions } from '@angular/http';
import { GlobalsService } from '../../shared';

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
    private http: Http
  ) {
    this.form = formBuilder.group({
      enableSSH: false
    });
  }

  ngOnInit() {
    const vchId = this.vch.id.split(':')[3];
    const serviceHost = '10.160.131.87';
    const servicePort = '31337';
    const targetHost = '10.192.93.240';
    const targetThumbprint = this.globalsService.getWebPlatform().getUserSession()['serversInfo'][0]['thumbprint'];

    // TODO: replace api endpoint IP with OVA IP and target IP with current target VC IP
    const url = `https://${serviceHost}:${servicePort}/container/target/${targetHost}/vch/${vchId}/log?thumbprint=${targetThumbprint}`;

    const headers  = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Basic YWRtaW5pc3RyYXRvckB2c3BoZXJlLmxvY2FsOkFkbWluITIz'
    });

    const options  = new RequestOptions({ headers: headers });

    this.loading = true;
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
  }
}
