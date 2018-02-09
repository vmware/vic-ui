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

import { Router } from '@angular/router';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApplianceService } from '../services/appliance.service';
import { appConfigToken, AppConfig } from '../config/app.config';

@Component({
  selector: 'app-init',
  templateUrl: './applianceInit.component.html',
  styleUrls: ['./applianceInit.component.scss']
})
export class ApplianceInitComponent implements OnInit {
  public form: FormGroup;
  public applianceStable: boolean;

  constructor(
    public auth: AuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    private appliance: ApplianceService
  ) {
    this.form = formBuilder.group({
      vcenter: [ '', Validators.required ],
      username: [ '', Validators.required ],
      password: [ '', Validators.required ]
    });
    this.applianceStable = false;
  }

  ngOnInit() {
    this.appliance.waitForApplianceReady().subscribe(v => {
      this.applianceStable = true;
    }, err => {
      console.error('too many errors! giving up');
    });
  }

  initAppliance() {
    this.auth.login(
      this.form.get('vcenter').value,
      this.form.get('username').value,
      this.form.get('password').value
    ).subscribe(v => {
      if (v) {
        this.router.navigate(['']);
      }
    }, (err) => {
      console.error(err);
    });
  }
}
