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
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'vic-vch-creation-operations-user',
  templateUrl: './operations-user.html',
  styleUrls: ['./operations-user.scss']
})
export class OperationsUserComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = formBuilder.group({
      opsUser: ['', Validators.required],
      opsPassword: ['', Validators.required],
      opsGrantPerms: false
    });
  }

  ngOnInit() { }

  onPageLoad() { }

  onCommit(): Observable<any> {
    const result = {
      'operations': {
        opsUser: this.form.get('opsUser').value.trim(),
        opsPassword: this.form.get('opsPassword').value,
      }
    };

    const opsGrantPermsValue = this.form.get('opsGrantPerms').value;

    if (opsGrantPermsValue) {
      result.operations['opsGrantPerms'] = opsGrantPermsValue;
    }

    return of(result);
  }
}
