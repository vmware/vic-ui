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
import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import { CreateVchWizardService } from '../create-vch-wizard.service';
import {
  numberPattern,
  unlimitedPattern,
  getNumericValidatorsArray
} from '../../shared/utils/validators';

const endpointMemoryDefaultValue = 2048;

@Component({
  selector: 'vic-vch-creation-compute-capacity',
  templateUrl: './compute-capacity.html',
  styleUrls: ['./compute-capacity.scss']
})
export class ComputeCapacityComponent implements OnInit {
  public form: FormGroup;
  public formErrMessage = '';
  public datacenter: any[] = [];
  public clusters: any[] = [];
  public resources: any[] = [];
  public isTreeLoading = false;
  public inAdvancedMode = false;
  public resourceLimits: any = {
    cpu: { maxUsage: null, minUsage: null, unreservedForPool: null },
    memory: { maxUsage: null, minUsage: null, unreservedForPool: null }
  };
  public selectedObjectName: string;
  public selectedResourceObjRef: string;
  private _selectedComputeResource: string;

  constructor(
    private formBuilder: FormBuilder,
    private createWzService: CreateVchWizardService
  ) {
    // create a FormGroup instance
    this.form = formBuilder.group({
      cpuLimit: [
        'Unlimited',
        getNumericValidatorsArray(true)
      ],
      memoryLimit: [
        'Unlimited',
        getNumericValidatorsArray(true)
      ],
      debug: '0',
      cpuReservation: [
        '1',
        getNumericValidatorsArray(false)
      ],
      cpuShares: '4000',
      memoryShares: '163840',
      memoryReservation: [
        '1',
        getNumericValidatorsArray(false)
      ],
      endpointCpu: [
        '1',
        getNumericValidatorsArray(false)
      ],
      endpointMemory: [
        endpointMemoryDefaultValue,
        getNumericValidatorsArray(false)
      ]
    });
  }

  // TODO: function that calls a service's method to load WIP data and replace form values

  ngOnInit() {

  }

  /**
   * Get the latest list of clusters
   */
  loadClusters() {
    this.isTreeLoading = true;
    this.createWzService
      .getClustersList()
      .subscribe(val => {
        this.clusters = val;
        this.isTreeLoading = false;
      });
  }

  /**
   * Get the latest list of Hosts, VirtualApps and ResourcePools
   * @param {string} clusterValue
   */
  loadResources(clusterValue: string) {
    this.isTreeLoading = true;
    this.createWzService
      .getHostsAndResourcePools(clusterValue)
      .subscribe(resources => {
        this.resources = resources;
        this.isTreeLoading = false;
      });
  }

  /**
   * Set the compute resource selected by the user.
   * @param {any} resource
   * @param {any?} cluster
   */
  selectComputeResource(resource: any, cluster?: any) {
    // TODO: improve
    this.createWzService.getDatacenter().subscribe(dcs => {
      const datacenterName = dcs[0]['text'];
      const nodeTypeId = resource['nodeTypeId'];
      const isCluster = nodeTypeId === 'DcCluster';
      let resourceObj;
      let computeResource = `/${datacenterName}/host`;
      if (isCluster) {
        computeResource = `${computeResource}/${resource['text']}`;
        resourceObj = resource['aliases'][0];

      } else {
        computeResource = cluster ?
          `${computeResource}/${cluster['text']}/${resource['text']}` :
          `${computeResource}/${resource['text']}`;
        resourceObj = resource['objRef'];
      }
      this.selectedResourceObjRef = resource['objRef'];
      this.selectedObjectName = resource['text'];
      this._selectedComputeResource = computeResource;

      // update resource limit & reservation info
      this.createWzService.getResourceAllocationsInfo(resourceObj, isCluster)
        .subscribe(response => {
          const cpu = response['cpu'];
          const memory = response['memory'];
          this.resourceLimits = response;

          // set max limit validator for cpu maxUsage
          this.form.get('cpuLimit').setValidators([
            ...getNumericValidatorsArray(true),
            Validators.max(cpu['maxUsage'])
          ]);

          // set max limit validator for memory maxUsage
          this.form.get('memoryLimit').setValidators([
            ...getNumericValidatorsArray(true),
            Validators.max(memory['maxUsage'])
          ]);

          if (this.inAdvancedMode) {
            // set max limit validator for endpointMemory
            this.form.get('endpointMemory').setValidators([
              ...getNumericValidatorsArray(false),
              Validators.max(memory['maxUsage'])
            ]);

            // set max limit validator for cpu unreservedForPool
            this.form.get('cpuReservation').setValidators([
              ...getNumericValidatorsArray(false),
              Validators.max(cpu['unreservedForPool'])
            ]);

            // set max limit validator for memory unreservedForPool
            this.form.get('memoryReservation').setValidators([
              ...getNumericValidatorsArray(false),
              Validators.max(memory['unreservedForPool'])
            ]);

            // This prevents the next button from getting disabled when the user selects a host or cluster that has less RAM
            // available for VM endpoint than the default value. As a solution, we set the smaller value between the default
            // value and memory['maxUsage']
            this.form.get('endpointMemory').setValue(Math.min(memory['maxUsage'], endpointMemoryDefaultValue) + '');
          } else {
            this.form.get('endpointMemory').setValidators([]);
            this.form.get('cpuReservation').setValidators([]);
            this.form.get('memoryReservation').setValidators([]);
          }

          this.form.get('cpuLimit').updateValueAndValidity();
          this.form.get('memoryLimit').updateValueAndValidity();
          this.form.get('endpointMemory').updateValueAndValidity();
          this.form.get('cpuReservation').updateValueAndValidity();
          this.form.get('memoryReservation').updateValueAndValidity();
        });
    });
  }

  get selectedComputeResource() {
    return this._selectedComputeResource;
  }

  onPageLoad() {
    // if compute resource is already selected return here
    if (this.selectedComputeResource) {
      return;
    }

    this.createWzService.getDatacenter().subscribe(dcs => {
      this.datacenter = dcs;
    });

    this.loadClusters();
  }

  onCommit(): Observable<any> {
    const errs: string[] = [];
    let formErrors = null;
    const results: any = {};

    if (!this.selectedComputeResource) {
      errs.push('Please choose a valid compute resource');
      formErrors = { invalidComputeResource: true };
    }

    this.form.setErrors(formErrors);

    if (this.form.invalid) {
      return Observable.throw(errs);
    } else {
      const cpuLimitValue = this.form.get('cpuLimit').value;
      const memoryLimitValue = this.form.get('memoryLimit').value;

      results['computeResource'] = this.selectedComputeResource;
      results['cpu'] = unlimitedPattern.test(cpuLimitValue) ? '0' : cpuLimitValue;
      results['memory'] = unlimitedPattern.test(memoryLimitValue) ? '0' : memoryLimitValue;
      if (this.inAdvancedMode) {
        results['debug'] = this.form.get('debug').value;
        results['cpuReservation'] = this.form.get('cpuReservation').value;
        results['cpuShares'] = this.form.get('cpuShares').value;
        results['memoryReservation'] = this.form.get('memoryReservation').value;
        results['memoryShares'] = this.form.get('memoryShares').value;
        results['endpointCpu'] = this.form.get('endpointCpu').value;
        results['endpointMemory'] = this.form.get('endpointMemory').value;
      }
      return Observable.of({ computeCapacity: results });
    }
  }

  toggleAdvancedMode() {
    this.inAdvancedMode = !this.inAdvancedMode;
  }
}
