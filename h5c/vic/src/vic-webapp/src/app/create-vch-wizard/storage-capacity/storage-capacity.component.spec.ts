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
import {StorageCapacityComponent} from './storage-capacity.component';

describe('StorageCapacityComponent', () => {

  const datastoreName = 'datastore';
  let component: StorageCapacityComponent;
  let fixture: ComponentFixture<StorageCapacityComponent>;
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
            getDatastores() {
              return Observable.of([{
                text: datastoreName
              }]);
            }
          }
        }
      ],
      declarations: [
        StorageCapacityComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageCapacityComponent);
    component = fixture.componentInstance;
    component.onPageLoad();

    service = fixture.debugElement.injector.get(CreateVchWizardService);
    spyOn(service, 'getDatastores').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should end with an invalid form on step commit without selecting image store',  () => {
    component.onCommit();
    expect(component.form.invalid).toBe(true);
  });

  it('should end with an valid form on step commit after selecting a image store', () => {
    component.form.get('imageStore').setValue(datastoreName);
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should validate advanced fields defaults values', () => {
    component.form.get('imageStore').setValue(datastoreName);
    component.toggleAdvancedMode();
    expect(component.form.get('volumeStores').enabled).toBeTruthy();
    component.onCommit();
    expect(component.form.valid).toBe(true);
    component.toggleAdvancedMode();
    expect(component.form.get('volumeStores').disabled).toBeTruthy();
  });

  it('should validate volume store fields', () => {
    component.toggleAdvancedMode();
    const controls = component.form.get('volumeStores')['controls'][0]['controls'];

    controls['volDatastore'].setValue(datastoreName);
    expect(controls['dockerVolName'].enabled).toBeTruthy();
    expect(controls['dockerVolName'].errors['required']).toBeTruthy();

    // Set Docker Volume Name to something incorrect
    controls['dockerVolName'].setValue('@name');
    expect(controls['dockerVolName'].errors['pattern']).toBeTruthy();

    // Set Docker Volume Name to something correct
    controls['dockerVolName'].setValue('volume name');
    expect(controls['dockerVolName'].valid).toBeTruthy();
  });

  it('should add and remove volume data store entries', () => {
    component.addNewVolumeDatastoreEntry();
    expect(component.form.get('volumeStores')['controls'].length).toBe(2);
    component.removeVolumeDatastoreEntry(1);
    expect(component.form.get('volumeStores')['controls'].length).toBe(1);
  });

  it('should have folder fields that begin with a slash', () => {
    const folderName = 'folder';
    const expectedFolderName = '/folder';
    component.form.get('imageStore').setValue(datastoreName);
    component.form.get('fileFolder').setValue(folderName);

    component.toggleAdvancedMode();

    const controls = component.form.get('volumeStores')['controls'][0]['controls'];
    controls['volDatastore'].setValue(datastoreName);
    controls['volFileFolder'].setValue(folderName);
    controls['dockerVolName'].setValue('volume');

    component.onCommit().subscribe( r => {
      expect(r.storageCapacity.fileFolder).toBe(expectedFolderName);
      expect(r.storageCapacity.volumeStores[0].volFileFolder).toBe(expectedFolderName);
    });

    // should not add an extra slash
    component.form.get('fileFolder').setValue(expectedFolderName);
    controls['volFileFolder'].setValue(expectedFolderName);

    component.onCommit().subscribe( r => {
      expect(r.storageCapacity.fileFolder).toBe(expectedFolderName);
      expect(r.storageCapacity.volumeStores[0].volFileFolder).toBe(expectedFolderName);
    });
  });
});
