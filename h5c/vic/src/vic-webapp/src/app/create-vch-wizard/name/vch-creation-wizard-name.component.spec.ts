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
import {VchCreationWizardNameComponent} from './vch-creation-wizard-name.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ClarityModule} from 'clarity-angular';
import {HttpModule} from '@angular/http';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';

describe('VchCreationWizardNameComponent', () => {

  const ValidVCHName = 'unique-vm-container-host';
  const InvalidVCHName = 'vm-container-host';

  let component: VchCreationWizardNameComponent;
  let fixture: ComponentFixture<VchCreationWizardNameComponent>;
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
            // Mock of the two possible values the service could respond with,
            // so we can test the validity of the form (for valid or invalid based on this mock).
            checkVchNameUniqueness(name) {
              // In test cases, use 'vm-container-host' to test for uniqueness.
              if (name === InvalidVCHName) {
                return Observable.of(false);
              } else {
                return Observable.of(true);
              }
            }
          }
        }
      ],
      declarations: [
        VchCreationWizardNameComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VchCreationWizardNameComponent);
    component = fixture.componentInstance;
    component.onPageLoad();
    service = fixture.debugElement.injector.get(CreateVchWizardService);

    // Using callThrough() here to actually call the method, not just spy it.
    // That way we can return what the mock method is returning (true or false)
    spyOn(service, 'checkVchNameUniqueness').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form using default values', () => {
    expect(component.form.valid).toBe(true);
  });

  it('should have a valid form after adding a name',  () => {
    component.form.get('name').setValue(ValidVCHName);
    expect(component.form.valid).toBe(true);
  });

  it('should have a invalid form after adding an invalid empty name',  () => {
    component.form.get('name').setValue('');
    expect(component.form.invalid).toBe(true);
  });

  it('should have a invalid form after adding an invalid length for name',  () => {
    // A name with more than 80 characters long will be considered invalid.
    component.form.get('name').setValue(ValidVCHName.repeat(10));
    expect(component.form.invalid).toBe(true);
  });

  it('should have a invalid form after adding an invalid name pattern',  () => {
    component.form.get('name').setValue('two@words');
    expect(component.form.invalid).toBe(true);
  });

  it('should check name uniqueness on step commit',  () => {
    component.form.get('name').setValue(ValidVCHName);
    component.onCommit();
    expect(service.checkVchNameUniqueness).toHaveBeenCalledWith(ValidVCHName);
  });

  it('should have a valid form after adding an unique name', () => {
    component.form.get('name').setValue(ValidVCHName);
    component.onCommit().subscribe(() => {
      expect(component.form.valid).toBe(true);
    })
  });

  it('should have a invalid form after adding an already defined name', () => {
    // Using InvalidVCHName will make the mock return a false value.
    component.form.get('name').setValue(InvalidVCHName);
    // We need to catch the returned error here because it is handled in the parent component.
    component.onCommit().catch((value) => {
      return Observable.of(value);
    }).subscribe(() => {
      // And now we can test the form validity when an already defined name is entered.
      expect(component.form.invalid).toBe(true);
    })
  });
});
