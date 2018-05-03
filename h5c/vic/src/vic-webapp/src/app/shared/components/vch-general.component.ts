import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';
import {VchForm} from './vch-form';
import {ipOrFqdnPattern, numberPattern, supportedCharsPattern} from '../utils/validators';

export interface VchGeneralModel {
  name: string;
  containerNameConvention: string;
  debug: number;
  syslogAddress: string;
}

export interface VchGeneralApiPayload {
  name: string;
  debug: number;
  syslog_addr: string;
  container?: {
    name_convention: string
  };
}

@Component({
  selector: 'vic-vch-general',
  templateUrl: './vch-general.component.html',
  styleUrls: ['./vch-general.component.scss']
})
export class VchGeneralComponent extends VchForm implements OnInit, OnDestroy {
  @Input() model: VchGeneralModel;

  private containerNameConventionPattern = /^(.*)({id}|{name})(.*)$/;
  private syslogAddressPattern = /^(tcp|udp):\/\/(.*):(.*)$/;
  private formValueChangesSubscription: Subscription;

  constructor(private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    const name = this.model.name;

    const [
      ,
      containerNameConventionPrefix = '',
      containerNameConvention = '{name}',
      containerNameConventionPostfix = ''
    ] = this.model.containerNameConvention.match(this.containerNameConventionPattern) || [];

    const debug = this.model.debug || 0;

    const [
      ,
      syslogTransport = 'tcp',
      syslogHost = '',
      syslogPort = '',
    ] = this.model.containerNameConvention.match(this.syslogAddressPattern) || [];

    this.form = this.formBuilder.group({
      name: [
        name,
        [
          Validators.required,
          Validators.maxLength(80),
          Validators.pattern(supportedCharsPattern)
        ]
      ],
      containerNameConventionPrefix,
      containerNameConvention,
      containerNameConventionPostfix,
      debug,
      syslogTransport,
      syslogHost: [
        syslogHost,
        [
          Validators.pattern(ipOrFqdnPattern)
        ]
      ],
      syslogPort: [
        syslogPort,
        [
          Validators.maxLength(5),
          Validators.pattern(numberPattern)
        ]
      ]
    });

    this.formValueChangesSubscription = this.form.valueChanges.subscribe(value => {
      if (this.form.valid) {
        this.model.name = value.name.trim();
        this.model.debug = parseInt(value.debug, 10);

        const prefix = value.containerNameConventionPrefix.trim(),
          postfix = value.containerNameConventionPostfix.trim();

        if (prefix || postfix) {
          this.model.containerNameConvention =
            prefix + value.containerNameConvention + postfix;
        }

        const {
          syslogTransportValue,
          syslogHostValue,
          syslogPortValue
        } = value;

        if (syslogHostValue && syslogPortValue) {
          this.model.syslogAddress = `${syslogTransportValue}://${syslogHostValue}:${syslogPortValue}`;
        }
      }
    });
  }

  ngOnDestroy() {
    this.formValueChangesSubscription.unsubscribe();
  }

  toApiPayload(): VchGeneralApiPayload {
    return {
      name: this.model.name,
      debug: this.model.debug,
      syslog_addr: this.model.syslogAddress,
      container: {
        name_convention: this.model.containerNameConvention
      }
    }
  }
}
