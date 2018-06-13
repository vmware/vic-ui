import {EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {VchViewKeys, VchViewTypes} from '../../interfaces/vch';
import {Subscription} from 'rxjs/Subscription';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../create-vch-wizard/create-vch-wizard.service';
import {ConfigureVchService} from '../../configure/configure-vch.service';
import {GlobalsService} from '../globals.service';

export abstract class VchComponentBase implements OnInit, OnDestroy {

  @Input() abstract model: VchViewTypes;
  @Input() readOnly: boolean;

  @Output() modelChanged: EventEmitter<{[key: string]: VchViewTypes}> = new EventEmitter();

  public form: FormGroup;
  protected formValueChangesSubscription: Subscription;
  protected isConfigure: boolean;
  protected abstract readonly initialModel: VchViewTypes;
  protected abstract readonly apiModelKey: VchViewKeys;

  constructor(protected formBuilder?: FormBuilder,
              protected createWzService?: CreateVchWizardService,
              protected globalsService?: GlobalsService,
              protected configureService?: ConfigureVchService) {
  }

  /**
   * If we are receiving an external model means we are on "configure" or "read only" mode. If not, we assume that our model is our
   * inintialModel. We update the form based on our model and we also subscribe to any further change in the form values in order to update
   * the model and emit the last model.
   */
  ngOnInit() {
    if (this.model) {
      this.isConfigure = true;
      this.updateFormAndModel(this.model);
      this.onPageLoad();
    } else {
      this.model = this.initialModel;
    }


    this.formValueChangesSubscription = this.form
      .valueChanges
      .subscribe(value => {
        this.updateCurrentModel();
        if (!this.readOnly) {
          this.emitCurrentModel();
        }
      });
  }

  /**
   * Updates the form values based on the received model and only if we have an external model (configure mode) we edit and emit
   * the current model.
   */
  protected updateFormAndModel(model: VchViewTypes) {
    this.initCurrentForm(model);
    this.updateCurrentModel();
    if (!this.readOnly) {
      this.emitCurrentModel();
    }
  }

  /**
   * Inits the current form. This should be implemented on each componente based on component form/model logic
   */
  protected abstract initCurrentForm(model: VchViewTypes);

  /**
   * Updates the current model. This should be implemented on each componente based on component form/model logic
   */
  protected abstract updateCurrentModel();

  /**
   * Commits an observable of the current component model.
   */
  abstract onCommit(): Observable<{[key: string]: VchViewTypes}>;

  /**
   * Emits the current model after any change in order to notify to any possible subscriptor but only if the form is valid, we don't want to
   * propagate an invalid model.
   */
  emitCurrentModel() {
    if (this.isValid()) {
      this.modelChanged.emit({[this.apiModelKey]: this.model});
    }
  }

  /**
   * Returns true/false based on form validity
   */
  isValid(): boolean {
    return this.form && this.form.valid;
  }

  /**
   * This should be implemented in order to be used by the creation wizard component. Components can optionally override implementation.
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

