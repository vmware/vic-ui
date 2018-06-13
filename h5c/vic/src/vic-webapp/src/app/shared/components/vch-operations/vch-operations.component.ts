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
import {Component, Input, OnInit} from '@angular/core';
import {VchComponentBase} from '../vch-component-base';
import {VchOperationsView, VchViewKeys} from '../../../interfaces/vch';
import {Observable} from 'rxjs/Observable';
import {FormBuilder, Validators} from '@angular/forms';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {I18nService} from '../../i18n.service';

@Component({
  selector: 'vic-vch-operations',
  templateUrl: './vch-operations.component.html',
  styleUrls: ['./vch-operations.component.scss']
})
export class VchOperationsComponent extends VchComponentBase implements OnInit {

  @Input()
  model: VchOperationsView;

  protected readonly apiModelKey: VchViewKeys = 'operations';
  protected readonly initialModel: VchOperationsView = {
    opsUser: '',
    opsPassword: '',
    opsGrantPerms: false
  };

  constructor(protected formBuilder: FormBuilder,
              protected createWzService: CreateVchWizardService,
              public i18n: I18nService) {
    super(formBuilder, createWzService);
    this.initCurrentForm(this.initialModel);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onCommit(): Observable<{ [key: string]: VchOperationsView }> {
    return Observable.of({[this.apiModelKey]: this.model});
  }

  protected initCurrentForm(model: VchOperationsView) {
    this.form = this.formBuilder.group({
      opsUser: [model.opsUser, Validators.required],
      opsPassword: [model.opsPassword, Validators.required],
      opsGrantPerms: model.opsGrantPerms ? model.opsGrantPerms : false
    });
  }

  protected updateCurrentModel() {
    if (this.form.valid) {
      const currentModel: VchOperationsView = {
        opsUser: this.form.get('opsUser').value,
        opsPassword: this.form.get('opsPassword').value,
      };

      const opsGrantPermsValue = this.form.get('opsGrantPerms').value;
      if (opsGrantPermsValue) {
        currentModel.opsGrantPerms = opsGrantPermsValue;
      }

      this.model = currentModel;
    }
  }

}
