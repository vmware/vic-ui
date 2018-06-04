import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {getClientOS} from '../../utils/detection';
import {FormBuilder, FormGroup} from '@angular/forms';
import {camelCasePattern} from '../../utils';
import {isUploadableFileObject} from '../../utils/model-checker';
import {VchView} from '../../../interfaces/vch';

type CommandType = 'create' | 'configure';

@Component({
  selector: 'vic-cli-command',
  templateUrl: './cli-command.component.html',
  styleUrls: ['./cli-command.component.scss']
})
export class CliCommandComponent implements OnInit {

  @Input()
  payload: Observable<VchView>;

  @Input()
  showCliCommand = true;

  @Input()
  commandType: CommandType;

  @Input()
  disabled = false;

  public form: FormGroup;
  public copySucceeded: boolean = null;
  public cliCommand: Observable<string>;
  private configureSkippedParams = [
    'computeResource',
  ];

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({targetOS: null, cliCommand: null});
  }

  ngOnInit() {
    const targetOSStream: Observable<string> = this.form.get('targetOS')
      .valueChanges
      .distinctUntilChanged()
      .startWith(getClientOS());

    const modelPayload: Observable<VchView> = this.payload;

    this.cliCommand = Observable.combineLatest(
        targetOSStream,
        modelPayload
      )
      .map(([targetOS, payload]) =>  {
        const cliCommand = this.toCliArguments(targetOS, payload);
        this.form.patchValue({targetOS: targetOS, cliCommand: cliCommand});
        return cliCommand;
      });
  }

  /**
   * Document copy event handler
   */
  copyCliCommand(): void {
    try {
      document.addEventListener('copy', this.copyCliCommandToClipboard.bind(this));
      this.copySucceeded = document.execCommand('copy');
      Observable.timer(1500)
        .subscribe(() => {
          this.copySucceeded = null;
        });
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Sets the clipboard data with the cliCommand form value
   */
  copyCliCommandToClipboard(event: ClipboardEvent) {
    event.clipboardData.setData('text/plain', this.form.get('cliCommand').value);
    event.preventDefault();
    document.removeEventListener('copy', this.copyCliCommandToClipboard);
  }

  /**
   * Convert camelcase keys into dash-separated ones, remove fields with
   * an empty array, and then return the array joined
   * @returns {string} vic-machine compatible arguments
   */
  toCliArguments(targetOS: string, payloadModel: VchView): string {
    if (!targetOS || !payloadModel || !this.commandType) {
      return null;
    }

    const payload = this.processPayload(payloadModel);
    const results = [];

    let vicMachineBinary = `vic-machine-${targetOS}`;
    const createCommand = this.commandType;
    if (targetOS !== 'windows') {
      vicMachineBinary = `./${vicMachineBinary}`;
    }
    results.push(vicMachineBinary);
    results.push(createCommand);

    for (const section in payload) {
      if (!payload[section] || !this.keyIsAvailable(section)) {
        continue;
      }
      // if there is only one entry in the section and it's of string type
      // add it to results array here
      const value0 = payload[section];
      if (typeof value0 === 'string' || typeof value0 === 'boolean' || typeof value0 === 'number') {

        if (typeof value0 === 'string' && !value0.trim()) {
          continue;
        }
        results.push(`--${this.keyFixCamelCase(section)} ${this.valueToString(value0)}`);
        continue;
      }

      for (const key in payload[section]) {

        if (!(payload[section][key]) || payload[section][key] === '0' || !this.keyIsAvailable(section)) {
          continue;
        }

        const value1 = payload[section][key];
        if (typeof value1 === 'string' || typeof value1 === 'boolean' || typeof value1 === 'number') {

          if (typeof value1 === 'string' && !value1.trim()) {
            continue;
          }
          results.push(`--${this.keyFixCamelCase(key)} ${this.valueToString(value1)}`);

        } else {

          // repeat adding multiple, optional fields with the same key
          for (const i in value1) {

            if (!value1[i] || value1[i] === '0' || !this.keyIsAvailable(section)) {
              continue;
            }

            const value2 = value1[i];
            if (typeof value2 === 'string' || typeof value1 === 'boolean' || typeof value1 === 'number') {

              if (typeof value2 === 'string' && !value2.trim()) {
                continue;
              }
              results.push(`--${this.keyFixCamelCase(key)} ${this.valueToString(value2)}`);

            } else {

              if (isUploadableFileObject(value2)) {
                results.push(`--${this.keyFixCamelCase(key)} ${this.valueToString(value2.name)}`);

              } else {

                for (const j in value2) {
                  if (!value2[j] || value2[j] === '0' || !this.keyIsAvailable(section)) {
                    continue;
                  }
                  results.push(`--${this.keyFixCamelCase(j)} ${this.valueToString(value2[j])}`);
                }

              }
            }
          }
        }
      }
    }
    return results.join(' ');
  }

  private valueToString(value: any): string {
    if (typeof value === 'string') {
      return this.escapeSpecialCharsForCLI(value);
    } else if (typeof value === 'boolean') {
          return '';
    } else if (typeof value === 'number') {
      return this.escapeSpecialCharsForCLI(value.toString());
    }
  }

  private keyFixCamelCase(value: any): string {
    return value.replace(camelCasePattern, '$1-$2').toLowerCase();
  }

  private escapeSpecialCharsForCLI(text) {
    return text.replace(/([() ])/g, '\\$&');
  }

  private keyIsAvailable(key: string): boolean {
    return this.commandType === 'configure' ?
      (this.configureSkippedParams.indexOf(key) === -1) : true;
  }

  /**
   * Transform payload to something vic-machine command friendly
   */
  private processPayload(payload: VchView): any {
    const results = JSON.parse(JSON.stringify(payload));

    // transform image store entry
    if (results['storageCapacity']) {
      results['storageCapacity']['imageStore'] =
        results['storageCapacity']['imageStore'] + (results['storageCapacity']['fileFolder'] || '');
      delete results['storageCapacity']['fileFolder'];

      const sizeUnit = results['storageCapacity']['baseImageSizeUnit'] ?
        results['storageCapacity']['baseImageSizeUnit'].replace('i', '') : '';
      results['storageCapacity']['baseImageSize'] += sizeUnit;
      delete results['storageCapacity']['baseImageSizeUnit'];

      // transform each volume store entry
      const volumeStoresRef = results['storageCapacity']['volumeStore'];
      results['storageCapacity']['volumeStore'] =
        volumeStoresRef.map(volStoreObj => {
          return `${volStoreObj['volDatastore']}${volStoreObj['volFileFolder']}:${volStoreObj['dockerVolName']}`;
        });
    }

    // transform gateways with routing destinations
    if (results['networks']) {
      if (results['networks']['clientNetworkRouting']) {
        results['networks']['clientNetworkGateway'] =
          `${results['networks']['clientNetworkRouting']}:${results['networks']['clientNetworkGateway']}`;
        delete results['networks']['clientNetworkRouting'];
      }

      if (results['networks']['managementNetworkRouting']) {
        results['networks']['managementNetworkGateway'] =
          `${results['networks']['managementNetworkRouting']}:${results['networks']['managementNetworkGateway']}`;
        delete results['networks']['managementNetworkRouting'];
      }

      // transform each container network entry
      if (results['networks']['containerNetworks']) {
        const containerNetworksRef = results['networks']['containerNetworks'];
        results['networks']['containerNetworks'] =
          containerNetworksRef.map(containerNetObj => {
            if (containerNetObj['containerNetworkType'] === 'dhcp') {
              const net = {
                containerNetwork: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkLabel'],
                containerNetworkFirewall: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkFirewall']
              };

              if (containerNetObj['containerNetworkDns']) {
                net['containerNetworkDns'] = containerNetObj['containerNetwork'] +
                  ':' + containerNetObj['containerNetworkDns'];
              }

              return net;
            } else {
              return {
                containerNetwork: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkLabel'],
                containerNetworkIpRange: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkIpRange'],
                containerNetworkGateway: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkGateway'],
                containerNetworkDns: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkDns'],
                containerNetworkFirewall: containerNetObj['containerNetwork'] +
                ':' + containerNetObj['containerNetworkFirewall']
              };
            }
          });
      }

    }

    // transform server cert and key
    if (results['security']) {
      if (results['security']['tlsServerCert']) {
        results['security']['tlsServerCert'] = results['security']['tlsServerCert']['name']
      }

      if (results['security']['tlsServerKey']) {
        results['security']['tlsServerKey'] = results['security']['tlsServerKey']['name']
      }
    }

    // remove password
    if (results['operations']) {
      if (results['operations']['opsPassword']) {
        delete results['operations']['opsPassword'];
      }
    }

    return results;
  }

}
