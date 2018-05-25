import {EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {VchUiModelKeys, VchUiModelTypes} from '../../interfaces/vch';
import {Subscription} from 'rxjs/Subscription';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../create-vch-wizard/create-vch-wizard.service';
import {ConfigureVchService} from '../../configure/configure-vch.service';
import {GlobalsService} from '../globals.service';

export abstract class VchComponentBase implements OnInit, OnDestroy {

  @Input() abstract model: VchUiModelTypes;
  @Input() readOnly: boolean;

  @Output() modelChanged: EventEmitter<{[key: string]: VchUiModelTypes}> = new EventEmitter();

  public form: FormGroup;
  protected formValueChangesSubscription: Subscription;
  protected isConfigure: boolean;
  protected abstract readonly initialModel: VchUiModelTypes;
  protected abstract readonly apiModelKey: VchUiModelKeys;

  constructor(protected formBuilder?: FormBuilder,
              protected createWzService?: CreateVchWizardService,
              protected globalsService?: GlobalsService,
              protected configureService?: ConfigureVchService) {
  }

  /**
   * If we are receiving an external model it means that we are on "configure" mode and we should update form and model. If not, we assume
   * that our model is our inintialModel
   */
  ngOnInit() {
    if (this.model) {
      this.model = Object.assign({}, this.model);
      this.isConfigure = true;
      this.updateFormAndModel(this.model);
      this.onPageLoad();
    } else {
      this.model = Object.assign({}, this.initialModel);
    }

    this.formValueChangesSubscription = this.form
      .valueChanges
      .subscribe(value => {
        this.updateCurrentModel();
        this.emitCurrentModel();
      });
  }

  /**
   * Updates the form values based on the received model and only if we have an external model (configure mode) we edit and emit
   * the current model
   */
  protected updateFormAndModel(model: VchUiModelTypes) {
    this.updateCurrentForm(model);
    if (this.model && !this.readOnly) {
      this.updateCurrentModel();
      this.emitCurrentModel();
    }
  }

  /**
   * Updates the current form. This should be implemented on each componente based on component form/model logic
   */
  protected abstract updateCurrentForm(model: VchUiModelTypes);

  /**
   * Updates the current model. This should be implemented on each componente based on component form/model logic
   */
  protected abstract updateCurrentModel();

  /**
   * Commits an observable of the current component model.
   */
  abstract onCommit(): Observable<{[key: string]: VchUiModelTypes}>;

  /**
   * Emits the current model after any change in order to notify to any possible subscriptor
   */
  emitCurrentModel() {
    this.modelChanged.emit({[this.apiModelKey]: this.model});
  }

  /**
   * Returns true/false based on form validity
   */
  isValid(): boolean {
    return this.form && this.form.valid;
  }

  /**
   * This should be implemented in order to be used by the creation wizzard component. Components can optionally override implementation
   */
  onPageLoad() {}

  /**
   * Returns true/false if the desired control is valid or not
   */
  isFormControlInvalid(control: AbstractControl) {
    return control.invalid && (control.dirty || control.touched);
  }

  /**
   * Deletes form value change subscription
   */
  ngOnDestroy() {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

}

