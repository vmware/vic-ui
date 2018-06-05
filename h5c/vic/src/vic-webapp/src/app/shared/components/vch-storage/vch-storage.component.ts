import {VchComponentBase} from '../vch-component-base';
import {Component, Input, OnInit} from '@angular/core';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {ConfigureVchService, SelectedComputeResourceInfo} from '../../../configure/configure-vch.service';
import {GlobalsService} from '../../globals.service';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {VchStorageView, VchStorageVolumeStoreView} from '../../../interfaces/vch';
import {numberPattern, supportedCharsPattern} from '../../utils/validators';
import {noBlankSpaces} from '../../utils';
import {I18nService} from '../../i18n.service';

@Component({
  selector: 'vic-vch-storage',
  templateUrl: './vch-storage.component.html',
  styleUrls: ['./vch-storage.component.scss']
})
export class VchStorageComponent extends VchComponentBase implements OnInit {

  @Input() set resourceObjRef(value) {
    if (typeof value !== 'undefined') {
      this.loadDatastore(value);
    }
  }

  @Input() model: VchStorageView;

  protected readonly apiModelKey = 'storageCapacity';
  protected readonly initialModel: VchStorageView = {
    baseImageSize: '8',
    baseImageSizeUnit: 'GiB',
    fileFolder: '',
    imageStore: '',
    volumeStore: []
  };

  public formErrMessage = '';
  public datastoresLoading = true;
  public datastores: VchStorageVolumeStoreView[] = [];
  public selectedComputeResourceInfo: Observable<SelectedComputeResourceInfo>;
  private _isSetup = false;
  private readonly dockerVolNameDefault = 'default';

  constructor(
    protected formBuilder: FormBuilder,
    protected createWzService: CreateVchWizardService,
    protected globalsService: GlobalsService,
    protected configureService: ConfigureVchService,
    public i18n: I18nService
  ) {
    super(formBuilder, createWzService, globalsService, configureService);
    this.updateCurrentForm(this.initialModel);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  protected updateCurrentForm(model: VchStorageView) {
    this.form = this.formBuilder.group({
      imageStore: [model.imageStore, Validators.required],
      fileFolder: model.fileFolder,
      baseImageSize: [
        model.baseImageSize,
        [
          Validators.required,
          Validators.pattern(numberPattern)
        ]
      ],
      baseImageSizeUnit: model.baseImageSizeUnit,
      enableAnonymousVolumes: model.volumeStore
        .some((volume: VchStorageVolumeStoreView) => volume.dockerVolName === this.dockerVolNameDefault),
      volumeStore: this.formBuilder.array(model.volumeStore.length > 0 ?
        this.getModelVolumesEntries(model.volumeStore) : [this.createNewVolumeDatastoreEntry()])
    });
  }

  protected updateCurrentModel() {
    if (this.form.valid) {
      const currentModel: VchStorageView = {
        baseImageSize: this.form.get('baseImageSize').value,
        baseImageSizeUnit: this.form.get('baseImageSizeUnit').value,
        fileFolder: '',
        imageStore: this.form.get('imageStore').value,
      };

      if (this.form.get('fileFolder').value) {
        let val = this.form.get('fileFolder').value;
        if (val.length && val.charAt(0) !== '/') {
          val = `/${val}`;
        }
        currentModel.fileFolder = val;
      }

      currentModel.volumeStore = this.form.get('volumeStore').value.filter((vol: VchStorageVolumeStoreView) => vol.volDatastore);
      currentModel.volumeStore.forEach((vol: VchStorageVolumeStoreView) => {
        // if volume file folder doesn't start with '/', prepend the value with '/'
        if (vol.volFileFolder.length && vol.volFileFolder.charAt(0) !== '/') {
          vol.volFileFolder = `/${vol.volFileFolder}`;
        }
      });

      this.model = currentModel;
    }
  }

  onCommit(): Observable<{[key: string]: VchStorageView}> {
    if (this.form.invalid) {
      if (this.form.get('imageStore').hasError('required')) {
        this.formErrMessage = 'Image store should be selected';
        return Observable.throw(this.formErrMessage);
      }
    }
    return Observable.of({[this.apiModelKey]: this.model});
  }

  // -----------------------------------------------------------

  loadDatastore(resource) {
    this.datastoresLoading = true;
    this.createWzService.getDatastores(resource)
      .subscribe(v => {
        this.datastores = v;
        this.datastoresLoading = false;
      }, err => console.error(err));
  }

  createNewVolumeDatastoreEntry(volumeInfo?: VchStorageVolumeStoreView) {
    return this.formBuilder.group({
      volDatastore: volumeInfo ? volumeInfo.volDatastore : '',
      volFileFolder: volumeInfo ? volumeInfo.volFileFolder : '',
      dockerVolName: [{ value: volumeInfo ?
          volumeInfo.dockerVolName : '', disabled: (!volumeInfo || volumeInfo && volumeInfo.dockerVolName === this.dockerVolNameDefault)}, [
        Validators.required,
        Validators.pattern(supportedCharsPattern),
        noBlankSpaces
      ]]
    });
  }

  addNewVolumeDatastoreEntry() {
    const volStores = this.form.get('volumeStore') as FormArray;
    volStores.push(this.createNewVolumeDatastoreEntry());
  }

  removeVolumeDatastoreEntry(index: number) {
    const volStores = this.form.get('volumeStore') as FormArray;
    volStores.removeAt(index);
  }

  getModelVolumesEntries(volumes: VchStorageVolumeStoreView[]) {
    const defaultVol: VchStorageVolumeStoreView = volumes
      .find((vol: VchStorageVolumeStoreView) => vol.dockerVolName === this.dockerVolNameDefault);

    // we want the default volume to be the 1st on the list, if there is no default volume then it doesn't mater.
    if (!defaultVol) {
      return volumes.map(volumeInfo => this.createNewVolumeDatastoreEntry(volumeInfo));
    } else {
      return [
        defaultVol,
        ...volumes.filter((vol: VchStorageVolumeStoreView) => vol.dockerVolName !== this.dockerVolNameDefault)
      ].map(volumeInfo => this.createNewVolumeDatastoreEntry(volumeInfo));
    }

  }

  onPageLoad() {
    // prevent subscribing to the following input changes for more than once
    if (this._isSetup) {
      return;
    }
    this.form.get('enableAnonymousVolumes').valueChanges
      .subscribe(v => {
        const volStores = this.form.get('volumeStore') as FormArray;
        if (v) {
          const defaultVolumeStore = this.createNewVolumeDatastoreEntry();
          const datastoreControl = defaultVolumeStore.get('volDatastore');
          datastoreControl.setValidators([
            Validators.required
          ]);
          datastoreControl.updateValueAndValidity();
          defaultVolumeStore.get('dockerVolName').setValue(this.dockerVolNameDefault);
          volStores.insert(0, defaultVolumeStore);
        } else {
          volStores.removeAt(0);
        }
      });

    this.form.get('volumeStore').valueChanges
      .subscribe(v => {
        v.forEach((item, index) => {
          const controls = this.form.get('volumeStore')['controls'][index]['controls'];
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

}
