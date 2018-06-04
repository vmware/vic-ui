import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {ipOrFqdnPattern, numberPattern, supportedCharsPattern} from '../../utils/validators';
import {VchGeneralView} from '../../../interfaces/vch';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {VchComponentBase} from '../vch-component-base';

@Component({
  selector: 'vic-vch-general',
  templateUrl: './vch-general.component.html',
  styleUrls: ['./vch-general.component.scss']
})
export class VchGeneralComponent extends VchComponentBase implements OnInit {

  @Input() model: VchGeneralView;

  private containerNameConventionPattern = /^(.*)({id}|{name})(.*)$/;
  private syslogAddressPattern = /^(tcp|udp):\/\/(.*):(.*)$/;
  private debugOptions: {value: number, display: string}[] = [
    {value: 0, display: '0 - Verbose logging is disabled'},
    {value: 1, display: '1 - Provides extra verbosity in the logs'},
    {value: 2, display: '2 - Exposes server on more interfaces, launches pprof in container VMs'},
    {value: 3, display: '3 - Disables recovery logic and logs sensitive data'}
  ];

  protected readonly apiModelKey = 'general';
  protected readonly initialModel: VchGeneralView = {
    name: 'virtual-container-host',
    containerNameConvention: '',
    debug: this.debugOptions[0].value,
    syslogAddress: ''
  };
  public vicApplianceIp: string;

  constructor(protected formBuilder: FormBuilder,
              protected createWzService: CreateVchWizardService) {
    super(formBuilder, createWzService);
    this.updateCurrentForm(this.initialModel);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  protected updateCurrentForm(model: VchGeneralView) {
    const [,
      containerNameConventionPrefix = '',
      containerNameConvention = '{name}',
      containerNameConventionPostfix = ''
    ] = model.containerNameConvention.match(this.containerNameConventionPattern) || [];

    const [,
      syslogTransport = 'tcp',
      syslogHost = '',
      syslogPort = '',
    ] = (model && model.syslogAddress.match(this.syslogAddressPattern)) || [];

    this.form = this.formBuilder.group({
      name: [model.name, [ Validators.required,
        Validators.maxLength(80),
        Validators.pattern(supportedCharsPattern)]],
      containerNameConventionPrefix,
      containerNameConvention,
      containerNameConventionPostfix,
      debug: model.debug || 0,
      syslogTransport,
      syslogHost: [syslogHost, [Validators.pattern(ipOrFqdnPattern)]],
      syslogPort: [syslogPort, [Validators.maxLength(5),
        Validators.pattern(numberPattern)]]
    });
  }

  protected updateCurrentModel() {
    if (this.form.valid) {
      const currentModel: VchGeneralView = {
        name: this.form.value.name.trim(),
        debug: this.form.value.debug,
        containerNameConvention: ''
      };

      const prefix = this.form.value.containerNameConventionPrefix.trim();
      const postfix = this.form.value.containerNameConventionPostfix.trim();

      if (prefix || postfix) {
        currentModel.containerNameConvention = `${prefix}${this.form.value.containerNameConvention}${postfix}`;
      }

      const {
        syslogTransport,
        syslogHost,
        syslogPort
      } = this.form.value;

      if (syslogHost && syslogPort) {
        currentModel.syslogAddress = `${syslogTransport}://${syslogHost}:${syslogPort}`;
      }

      this.model = currentModel;
    }
  }

  /**
   * Async validation for the Name section
   * This calls the VchCreationWizardService to check if the provided name
   * is unique among VirtualApps and ResourcePools on VC and then returns
   * an observable of the name or any error
   * @returns {Observable<any>}
   */
  onCommit(): Observable<{[key: string]: VchGeneralView}> {
    return Observable
      .zip(
        this.createWzService.getVicApplianceIp(),
        this.createWzService.checkVchNameUniqueness(this.form.get('name').value)
      )
      .catch(err => {
        // if any failure occurrs, unset the vicApplianceIp var
        this.vicApplianceIp = null;
        return Observable.throw(err);
      })
      .switchMap((arr) => {
        this.vicApplianceIp = arr[0];
        const isUnique = arr[1];
        if (!isUnique) {
          this.form.get('name').setErrors({
            resourcePoolExists: true
          });
          return Observable.throw(
            ['There is already a VirtualApp or ResourcePool that exists with the same name']);
        }

        return Observable.of({[this.apiModelKey]: this.model});
      });
  }


}
