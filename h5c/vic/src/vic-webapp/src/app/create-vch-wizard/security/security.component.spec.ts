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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ClarityModule} from 'clarity-angular';
import {HttpModule} from '@angular/http';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';
import {SecurityComponent} from './security.component';

describe('SecurityComponent', () => {

  let component: SecurityComponent;
  let fixture: ComponentFixture<SecurityComponent>;
  let service: CreateVchWizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      providers: [
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
        }
      ],
      declarations: [
        SecurityComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityComponent);
    component = fixture.componentInstance;
    component.onPageLoad();

    service = fixture.debugElement.injector.get(CreateVchWizardService);
    spyOn(service, 'getUserId').and.callThrough();
    spyOn(service, 'getServerThumbprint').and.callThrough();
    spyOn(service, 'getVcHostname').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form',  () => {
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should validate advanced fields defaults values', () => {
    component.toggleAdvancedMode();
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should validate advanced fields changes', () => {
    component.toggleAdvancedMode();

    component.form.get('useTls').setValue(false);
    expect(component.form.get('certificateKeySize').disabled).toBeTruthy();

    component.form.get('useTls').setValue(true);
    expect(component.form.get('certificateKeySize').enabled).toBeTruthy();

    component.form.get('useWhitelistRegistry').setValue(false);
    expect(component.form.get('whitelistRegistries').disabled).toBeTruthy();

    component.form.get('useWhitelistRegistry').setValue(true);
    expect(component.form.get('whitelistRegistries').enabled).toBeTruthy();
  });

  it('should add and remove client certificate entries', () => {
    component.addNewFormArrayEntry('tlsCas');
    expect(component.form.get('tlsCas')['controls'].length).toBe(2);
    component.removeFormArrayEntry('tlsCas', 1);
    expect(component.form.get('tlsCas')['controls'].length).toBe(1);
    component.removeFormArrayEntry('tlsCas', 0);
    // It should not remove the last one (only its contents) so the user can add na new entry.
    expect(component.form.get('tlsCas')['controls'].length).toBe(1);
  });

  it('should add and remove registry certificate entries', () => {
    component.addNewFormArrayEntry('registryCas');
    expect(component.form.get('registryCas')['controls'].length).toBe(2);
    component.removeFormArrayEntry('registryCas', 1);
    expect(component.form.get('registryCas')['controls'].length).toBe(1);
    component.removeFormArrayEntry('registryCas', 0);
    // It should not remove the last one (only its contents) so the user can add na new entry.
    expect(component.form.get('registryCas')['controls'].length).toBe(1);
  });
});
