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
import { Component, OnInit, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { CreateVchWizardService } from '../create-vch-wizard.service';
import { supportedCharsPattern, numberPattern } from '../../shared/utils/validators';

@Component({
  selector: 'vic-vch-creation-storage-capacity',
  templateUrl: './storage-capacity.html',
  styleUrls: ['./storage-capacity.scss']
})
export class StorageCapacityComponent implements OnInit {
  public form: FormGroup;
  public formErrMessage = '';
  public datastores: any[] = [];
  public datastoresLoading = true;
  private _isSetup = false;
  @Input() set resourceObjRef(value) {
    if (typeof value !== 'undefined') {
      this.loadDatastore(value);
    }
  }

  constructor(
    private formBuilder: FormBuilder,
    private createWzService: CreateVchWizardService
  ) {
    this.form = formBuilder.group({
      imageStore: ['', Validators.required],
      fileFolder: '',
      baseImageSize: [
        '8',
        [
          Validators.required,
          Validators.pattern(numberPattern)
        ]
      ],
      baseImageSizeUnit: 'GiB',
      enableAnonymousVolumes: false,
      volumeStores: formBuilder.array([this.createNewVolumeDatastoreEntry()])
    });
  }

  ngOnInit() { }

  addNewVolumeDatastoreEntry() {
    const volStores = this.form.get('volumeStores') as FormArray;
    volStores.push(this.createNewVolumeDatastoreEntry());
  }

  removeVolumeDatastoreEntry(index: number) {
    const volStores = this.form.get('volumeStores') as FormArray;
    volStores.removeAt(index);
  }

  createNewVolumeDatastoreEntry() {
    return this.formBuilder.group({
      volDatastore: '',
      volFileFolder: '',
      dockerVolName: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.pattern(supportedCharsPattern)
      ]]
    });
  }

  loadDatastore(resource) {
    this.datastoresLoading = true;
    this.createWzService.getDatastores(resource)
      .subscribe(v => {
        this.datastores = v;
        this.form.get('imageStore').setValue('');
        this.datastoresLoading = false;
      }, err => console.error(err));
  }

  datastoreTrackByFn(index, datastore) {
    return datastore.id;
  }

  onPageLoad() {

    // prevent subscribing to the following input changes for more than once
    if (this._isSetup) {
      return;
    }

    this.form.get('enableAnonymousVolumes').valueChanges
      .subscribe(v => {
        const volStores = this.form.get('volumeStores') as FormArray;
        if (v) {
          const defaultVolumeStore = this.createNewVolumeDatastoreEntry();
          const datastoreControl = defaultVolumeStore.get('volDatastore');
          datastoreControl.setValidators([
            Validators.required
          ]);
          datastoreControl.updateValueAndValidity();
          defaultVolumeStore.get('dockerVolName').setValue('default');
          volStores.insert(0, defaultVolumeStore);
        } else {
          volStores.removeAt(0);
        }
      });

    this.form.get('volumeStores').valueChanges
      .subscribe(v => {
        v.forEach((item, index) => {
          const controls = this.form.get('volumeStores')['controls'][index]['controls'];
          const labelControl = controls['dockerVolName'];
          const datastoreControl = controls['volDatastore'];
          if (datastoreControl.value && labelControl.disabled) {
            labelControl.enable();
          } else if (!datastoreControl.value && labelControl.enabled) {
            labelControl.disable();
          }
        });
      });

    this._isSetup = true;
  }

  /**
   */
  onCommit(): Observable<any> {
    const results: any = {};

    if (this.form.invalid) {
      if (this.form.get('imageStore').hasError('required')) {
        this.formErrMessage = 'Image store should be selected';
        return Observable.throw(this.formErrMessage);
      }
    }

    results['imageStore'] = this.form.get('imageStore').value;
    if (this.form.get('fileFolder').value) {
      let val = this.form.get('fileFolder').value;
      if (val.length && val.charAt(0) !== '/') {
        val = '/' + val;
      }
      results['fileFolder'] = val;
    }

    results['baseImageSize'] = this.form.get('baseImageSize').value;
    results['baseImageSizeUnit'] = this.form.get('baseImageSizeUnit').value;

    // filter ones with empty datastore
    results['volumeStores'] = this.form.get('volumeStores').value
      .filter(vol => vol['volDatastore']);

    results['volumeStores'].forEach(vol => {
      // if volume file folder doesn't start with '/', prepend the value with '/'
      if (vol['volFileFolder'].length && vol['volFileFolder'].charAt(0) !== '/') {
        vol['volFileFolder'] = '/' + vol['volFileFolder'];
      }
    });

    return Observable.of({ storageCapacity: results });
  }
}
