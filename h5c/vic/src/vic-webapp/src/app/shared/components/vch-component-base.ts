import {EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {VchUiCompute, VchUiGeneral, VchUiModelKeys, VchUiModelTypes} from '../../interfaces/vch';
import {Subscription} from 'rxjs/Subscription';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../create-vch-wizard/create-vch-wizard.service';
import {ConfigureVchService} from '../../configure/configure-vch.service';
import {GlobalsService} from '../globals.service';


export abstract class VchComponentBase implements OnInit, OnDestroy {

  @Input() abstract model: VchUiModelTypes;
  @Input() readOnly: boolean;

  @Output() modelChanged: EventEmitter<VchUiModelTypes> = new EventEmitter();

  public form: FormGroup;
  protected formValueChangesSubscription: Subscription;
  protected isConfigure: boolean;
  protected abstract readonly initialModel: VchUiModelTypes;

  constructor(protected formBuilder?: FormBuilder,
              protected createWzService?: CreateVchWizardService,
              protected globalsService?: GlobalsService,
              protected configureService?: ConfigureVchService) {
  }

  ngOnInit() {
    if (this.model) {
      this.isConfigure = true;
      this.setFormValues(this.model);
      this.onPageLoad();
    } else {
      this.model = this.initialModel;
    }

    this.formValueChangesSubscription = this.form
      .valueChanges
      .subscribe(value => this.updateCurrentModel());
  }

  protected abstract setFormValues(model: VchUiModelTypes);

  protected abstract updateCurrentModel();

  abstract onCommit(): Observable<{[key: string]: VchUiModelTypes}>;

  emitCurrentModel() {
    this.modelChanged.emit(this.model);
  }

  isValid(): boolean {
    return this.form && this.form.valid;
  }

  onPageLoad() {}

  isFormControlInvalid(controlName: string) {
    const control = this.form.get(controlName);
    return control.invalid && (control.dirty || control.touched);
  }

  ngOnDestroy() {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

}

