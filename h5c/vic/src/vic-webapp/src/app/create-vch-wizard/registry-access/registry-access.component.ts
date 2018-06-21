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
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { numberPattern, whiteListRegistryPattern } from '../../shared/utils/validators';
import {
  parseCertificatePEMFileContent,
  CertificateInfo
} from '../../shared/utils/certificates';

@Component({
  selector: 'vic-vch-creation-registry-access',
  templateUrl: './registry-access.html',
  styleUrls: ['./registry-access.scss']
})
export class RegistryAccessComponent {
  public form: FormGroup;
  public registryCaContents: any[] = [];
  public registryCaError: string = null;
  private _isSetup = false;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.form = formBuilder.group({
      useWhitelistRegistry: false,
      insecureRegistries: formBuilder.array([this.createNewFormArrayEntry('insecureRegistries')]),
      whitelistRegistries: formBuilder.array([this.createNewFormArrayEntry('whitelistRegistries')]),
      registryCas: formBuilder.array([this.createNewFormArrayEntry('registryCas')])
    });

    // Since useWhitelistRegistry is false by default, disable whitelistRegistries validations
    this.form.get('whitelistRegistries').disable();
  }

  addNewFormArrayEntry(controlName: string) {
    const control = this.form.get(controlName) as FormArray;
    if (!control) {
      return;
    }
    control.push(this.createNewFormArrayEntry(controlName));
  }

  createNewFormArrayEntry(controlName: string) {
    if (controlName === 'insecureRegistries') {
      return this.formBuilder.group({
        insecureRegistryIp: '',
        insecureRegistryPort: [
          '',
          [
            Validators.maxLength(5),
            Validators.pattern(numberPattern)
          ]
        ]
      });
    } else if (controlName === 'whitelistRegistries') {
      return this.formBuilder.group({
        whitelistRegistry: ['', [
          Validators.required,
          Validators.pattern(whiteListRegistryPattern)
        ]],
        whitelistRegType: 'secure'
      });
    } else if (controlName === 'registryCas') {
      return this.formBuilder.group({
        registryCa: ''
      });
    }
  }

  removeFormArrayEntry(controlName: string, index: number) {
    const control = this.form.get(controlName) as FormArray;
    if (!control) {
      return;
    }

    if (controlName === 'registryCas') {
      if (index > 0 || (index === 0 && control.controls.length > 1)) {
        control.removeAt(index);
        this.registryCaContents.splice(index, 1);
      } else {
        this.registryCaContents.shift();
        control.controls[index].reset();
      }
    } else {
      control.removeAt(index);
    }
  }

  onPageLoad() {

    if (this._isSetup) {
      return;
    }

    this.form.get('useWhitelistRegistry').valueChanges
      .subscribe(v => {
        if (v) {
          this.form.get('whitelistRegistries').enable();
        } else {
          this.form.get('whitelistRegistries').disable();
        }
      });

    this._isSetup = true;
  }

  onCommit(): Observable<any> {
    const results: any = {};

    const useWhitelistRegistryValue = this.form.get('useWhitelistRegistry').value;
    const insecureRegistriesValue = this.form.get('insecureRegistries').value;
    const whitelistRegistriesValue = this.form.get('whitelistRegistries').value;

    if (!useWhitelistRegistryValue) {
      results['whitelistRegistry'] = [];
      results['insecureRegistry'] = insecureRegistriesValue.filter(val => {
        return val['insecureRegistryIp'];
      }).map(val => (val['insecureRegistryPort'] === '' ? `${val['insecureRegistryIp']}` :
       `${val['insecureRegistryIp']}:${val['insecureRegistryPort']}`));
    } else {
      const white = [];
      const insecure = [];
      whitelistRegistriesValue.filter(val => {
        return val['whitelistRegistry'];
      }).forEach(val => {
        if (val['whitelistRegType'] === 'secure') {
          white.push(val['whitelistRegistry']);
        } else {
          insecure.push(val['whitelistRegistry']);
        }
      });

      results['whitelistRegistry'] = white;
      results['insecureRegistry'] = insecure;
    }

    results['registryCa'] = this.registryCaContents;

    return Observable.of({ registry: results });
  }

  /**
   * On Change event read the content of the file and add it to the
   * corresponding array or overwrite the value at the given index
   */
  addFileContent(evt: Event, targetField: string, index: number, isLast: boolean) {
    const fr = new FileReader();
    const fileList: FileList = evt.target['files'];

    const fileReaderOnLoadFactory = (filename: string) => {
      let certificate: CertificateInfo;

      switch (targetField) {
        case 'registryCas': return (event) => {
          let targetArray: any[];

          targetArray = this.registryCaContents;

          try {
            certificate = parseCertificatePEMFileContent(event.target.result);
          } catch (e) {
            // TODO: i18n-ify
            this.registryCaError = 'Failed to parse registry certificate PEM file!';
            return;
          }

          if (isLast) {
            this.addNewFormArrayEntry(targetField);
          }

          const value = {
            name: filename,
            content: event.target.result,
            expires: certificate.expires
          };

          if (targetArray[index]) {
            // overwrite if value already exists at this index
            targetArray[index] = value;
          } else {
            targetArray.push(value);
          }
        };
      }
    };

    // since input is without the 'multiple' attribute we are sure that
    // only one entry will be available under FileList
    const fileInstance: File = fileList[0];

    // TODO: i18n-ify
    if (targetField === 'registryCas') {
      this.registryCaError = fileInstance ? null : 'Failed to load registry certificate PEM file!';
    }
    fr.onload = fileReaderOnLoadFactory(fileInstance.name);
    fr.readAsText(fileInstance);
  }

  /**
   * Clear the file reader error messages. This method is called when clr-tab's
   * clrTabsCurrentTabContentChanged event is fired
   */
  clearFileReaderError() {
    this.registryCaError = null;
  }
}
