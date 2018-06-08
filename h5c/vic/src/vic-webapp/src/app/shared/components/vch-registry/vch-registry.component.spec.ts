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

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormGroup} from '@angular/forms';
import {ClarityModule} from '@clr/angular';
import {HttpModule} from '@angular/http';
import {FormBuilder, FormArray} from '@angular/forms';
import {VchRegistryComponent} from './vch-registry.component';
import {AppAlertService} from '../../app-alert.service';
import {I18nService} from '../../i18n.service';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';
import {GlobalsService} from '../../globals.service';
import {ConfigureVchService} from '../../../configure/configure-vch.service';
import {HttpClientModule} from '@angular/common/http';

describe('RegistryAccessComponent', () => {

  let component: VchRegistryComponent;
  let fixture: ComponentFixture<VchRegistryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        HttpClientModule,
        ClarityModule
      ],
      declarations: [VchRegistryComponent],
      providers: [
        AppAlertService,
        I18nService,
        FormBuilder,
        ConfigureVchService,
        {
          provide: CreateVchWizardService,
          useValue: {
            getUserId() {
              return Observable.of('userId');
            },
            getServerThumbprint() {
              return Observable.of('serverThumbprint');
            },
            getVcHostname() {
              return Observable.of('vcHostname');
            }
          }
        },
        {
          provide: GlobalsService,
          useValue: {
            isPluginMode: () => {
              return true;
            },
            getWebPlatform() {
              return {
                getUserSession() {
                  return {
                    serversInfo: [{
                      name: 'server.vpshere.local',
                      serviceGuid: 'aaaa-bbb-ccc',
                      thumbprint: 'AA:BB:CC'
                    }]
                  }
                }
              }
            }
          }
        }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VchRegistryComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    component.onPageLoad();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form',  () => {
    expect(component.form.valid).toBe(true);
  });

  it('should validate advanced fields changes', () => {
    component.form.get('useWhitelistRegistry').setValue(false);
    expect(component.form.get('whitelistRegistries').disabled).toBeTruthy();

    component.form.get('useWhitelistRegistry').setValue(true);
    expect(component.form.get('whitelistRegistries').enabled).toBeTruthy();
  });

  it('should add insecure registry entries without port', () => {
    let insecureRegistry1, insecureRegistry2: FormGroup;
    const control = component.form.get('insecureRegistries') as FormArray;
    component.removeFormArrayEntry('insecureRegistries', 0);
    // Adding one registry with port
    insecureRegistry1 = component.createNewFormArrayEntry('insecureRegistries');
    insecureRegistry1.controls['insecureRegistryIp'].setValue('1.2.3.4');
    insecureRegistry1.controls['insecureRegistryPort'].setValue('22');
    control.push(insecureRegistry1);
    // Adding one registry without port
    insecureRegistry2 = component.createNewFormArrayEntry('insecureRegistries');
    insecureRegistry2.controls['insecureRegistryIp'].setValue('4.3.2.1');
    control.push(insecureRegistry2);
    component.onCommit().subscribe(
      res => {
        expect(res.registry.insecureRegistry.length).toBe(2);
      }
    )
  });

  it('should not add insecure registry entries without ip', () => {
    let insecureRegistry1: FormGroup;
    const control = component.form.get('insecureRegistries') as FormArray;
    component.removeFormArrayEntry('insecureRegistries', 0);
    // Adding one registry without ip
    insecureRegistry1 = component.createNewFormArrayEntry('insecureRegistries');
    insecureRegistry1.controls['insecureRegistryPort'].setValue('22');
    control.push(insecureRegistry1);
    component.onCommit().subscribe(
      res => {
        expect(res.registry.insecureRegistry.length).toBe(0);
      }
    )
  });

  it('should add and remove registry certificate entries', () => {
    component.addNewFormArrayEntry('registryCas');
    expect(component.form.get('registryCas')['controls'].length).toBe(2);
    component.removeFormArrayEntry('registryCas', 1);
    expect(component.form.get('registryCas')['controls'].length).toBe(1);
    component.removeFormArrayEntry('registryCas', 0);
    // It should not remove the last one (only its contents) so the user can add a new entry.
    expect(component.form.get('registryCas')['controls'].length).toBe(1);
  });

  it('should return null for invalid controlName', () => {
    expect(component.addNewFormArrayEntry(null)).toBeUndefined();
    expect(component.removeFormArrayEntry(null, 0)).toBeUndefined();
  });

  it('should handle adding a correctly formatted Registry Cert', () => {
    const evt = new Event('change');
    const certContent = `-----BEGIN CERTIFICATE-----
MIICEjCCAXsCAg36MA0GCSqGSIb3DQEBBQUAMIGbMQswCQYDVQQGEwJKUDEOMAwG
A1UECBMFVG9reW8xEDAOBgNVBAcTB0NodW8ta3UxETAPBgNVBAoTCEZyYW5rNERE
MRgwFgYDVQQLEw9XZWJDZXJ0IFN1cHBvcnQxGDAWBgNVBAMTD0ZyYW5rNEREIFdl
YiBDQTEjMCEGCSqGSIb3DQEJARYUc3VwcG9ydEBmcmFuazRkZC5jb20wHhcNMTIw
ODIyMDUyNjU0WhcNMTcwODIxMDUyNjU0WjBKMQswCQYDVQQGEwJKUDEOMAwGA1UE
CAwFVG9reW8xETAPBgNVBAoMCEZyYW5rNEREMRgwFgYDVQQDDA93d3cuZXhhbXBs
ZS5jb20wXDANBgkqhkiG9w0BAQEFAANLADBIAkEAm/xmkHmEQrurE/0re/jeFRLl
8ZPjBop7uLHhnia7lQG/5zDtZIUC3RVpqDSwBuw/NTweGyuP+o8AG98HxqxTBwID
AQABMA0GCSqGSIb3DQEBBQUAA4GBABS2TLuBeTPmcaTaUW/LCB2NYOy8GMdzR1mx
8iBIu2H6/E2tiY3RIevV2OW61qY2/XRQg7YPxx3ffeUugX9F4J/iPnnu1zAxxyBy
2VguKv4SWjRFoRkIfIlHX0qVviMhSlNy2ioFLy7JcPZb+v3ftDGywUqcBiVDoea0
Hn+GmxZA
-----END CERTIFICATE-----`;
    spyOnProperty(evt, 'target', 'get').and.returnValue({
      files: [
        new File([certContent], 'foo.txt', { type: 'text/plain' })
      ]
    });

    component.addFileContent(evt, 'registryCas', 0, true);
    expect(component.registryCaError).toBeNull();
  });

  it('should handle a malformatted Registry Cert correctly', () => {
    const evt = new Event('change');
    const certContent = `oops!`;
    spyOnProperty(evt, 'target', 'get').and.returnValue({
      files: [
        new File([certContent], 'foo.txt', { type: 'text/plain' })
      ]
    });

    component.addFileContent(evt, 'registryCas', 0, true);
  });

  it('should clear file reader errors', () => {
    component.clearFileReaderError();
    expect(component.registryCaError).toBeFalsy();
  });

  it('should end with an valid form on step commit', () => {
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });
});
