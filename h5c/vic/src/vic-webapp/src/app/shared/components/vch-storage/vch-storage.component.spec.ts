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
import {ClarityModule} from '@clr/angular';
import {HttpModule} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {VchStorageComponent} from './vch-storage.component';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {GlobalsService} from '../../globals.service';
import {ConfigureVchService} from '../../../configure/configure-vch.service';
import {HttpClientModule} from '@angular/common/http';
import {VchStorageView} from '../../../interfaces/vch';
import {AppAlertService} from '../../app-alert.service';
import {I18nService} from '../../i18n.service';

describe('StorageCapacityComponent', () => {

  const datastoreName = 'datastore';
  let component: VchStorageComponent;
  let fixture: ComponentFixture<VchStorageComponent>;
  let service: CreateVchWizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        HttpClientModule,
        ClarityModule
      ],
      providers: [
        AppAlertService,
        I18nService,
        ConfigureVchService,
        {
          provide: CreateVchWizardService,
          useValue: {
            getDatastores() {
              return Observable.of([{
                text: datastoreName
              }]);
            }
          }
        },
        {
          provide: GlobalsService,
          useValue: {
            getWebPlatform () {
              return {
                getUserSession () {
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
      ],
      declarations: [
        VchStorageComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VchStorageComponent);
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

  it('should validate volume store fields', () => {
    const controls = component.form.get('volumeStore')['controls'][0]['controls'];

    controls['volDatastore'].setValue(datastoreName);
    expect(controls['dockerVolName'].enabled).toBeTruthy();
    expect(controls['dockerVolName'].errors['required']).toBeTruthy();

    // Set Docker Volume Name to something incorrect
    controls['dockerVolName'].setValue('@name');
    expect(controls['dockerVolName'].errors['pattern']).toBeTruthy();

    // Set Docker Volume Name to something correct
    controls['dockerVolName'].setValue('volumeName');
    expect(controls['dockerVolName'].valid).toBeTruthy();
  });

  it('should add and remove volume data store entries', () => {
    component.addNewVolumeDatastoreEntry();
    expect(component.form.get('volumeStore')['controls'].length).toBe(2);
    component.removeVolumeDatastoreEntry(1);
    expect(component.form.get('volumeStore')['controls'].length).toBe(1);
  });

  it('should have folder fields that begin with a slash', () => {
    const folderName = 'folder';
    const expectedFolderName = '/folder';

    const dataModel: VchStorageView = {
      baseImageSize: '8',
      baseImageSizeUnit: 'GiB',
      fileFolder: folderName,
      imageStore: datastoreName,
      volumeStore: [{
        volDatastore: datastoreName,
        volFileFolder: folderName,
        dockerVolName: 'volume'
      }]
    };

    // in order to call a private / protected method to force models update...
    component['updateFormAndModel'](dataModel);
    component['updateCurrentModel']();
    component.onCommit().subscribe( r => {
      expect(r.storageCapacity.fileFolder).toBe(expectedFolderName);
      expect(r.storageCapacity.volumeStore[0].volFileFolder).toBe(expectedFolderName);
    });

    // should not add an extra slash
    dataModel.fileFolder = expectedFolderName;
    dataModel.volumeStore[0].volFileFolder = expectedFolderName;
    // in order to call a private / protected method to force models update...
    component['updateFormAndModel'](dataModel);
    component['updateCurrentModel']();
    component.onCommit().subscribe( r => {
      expect(r.storageCapacity.fileFolder).toBe(expectedFolderName);
      expect(r.storageCapacity.volumeStore[0].volFileFolder).toBe(expectedFolderName);
    });
  });
});
