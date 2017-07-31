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

const unlimitedRegexPattern = new RegExp(/^[Uu]nlimited$/);
const unlimitedOrNumPattern = new RegExp(/(^[uU]nlimited$|^\d+$)/);
const numPattern = new RegExp(/^\d+$/);

function getNumericValidatorsArray(allowUnlimited: boolean) {
    return [
        Validators.required,
        Validators.pattern(allowUnlimited ? unlimitedOrNumPattern : numPattern),
        Validators.min(1)
    ];
}

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
        cpu: { maxUsage: null, unreservedForPool: null },
        memory: { maxUsage: null, unreservedForPool: null }
    };
    public selectedObjectName: string;
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
                '2048',
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
            } else if (nodeTypeId === 'ClusterHostSystem') {
                computeResource = `${computeResource}/${cluster['text']}/${resource['text']}`;
                resourceObj = resource['objRef'];
            }
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

        // listen for cpuLimit changes and handle validation errors
        this.form.get('cpuLimit').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                const cpuLimitFormControl = this.form.get('cpuLimit');
                if (cpuLimitFormControl.hasError('required')) {
                    this.formErrMessage = 'CPU limit cannot be empty!';
                    return;
                }
                if (cpuLimitFormControl.hasError('pattern')) {
                    this.formErrMessage = 'CPU limit should either be \'Unlimited\' or a number!';
                    return;
                }
                if (cpuLimitFormControl.hasError('min')) {
                    this.formErrMessage = 'CPU limit should be bigger than 0!';
                    return;
                }
                if (cpuLimitFormControl.hasError('max')) {
                    this.formErrMessage = `CPU limit cannot be bigger than ${this.resourceLimits['cpu']['maxUsage']} MHz!`;
                    return;
                }
            });

        // listen for memoryLimit changes and handle validation errors
        this.form.get('memoryLimit').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                const memoryLimitFormControl = this.form.get('memoryLimit');
                if (memoryLimitFormControl.hasError('required')) {
                    this.formErrMessage = 'Memory limit cannot be empty!';
                    return;
                }
                if (memoryLimitFormControl.hasError('pattern')) {
                    this.formErrMessage = 'Memory limit should either be \'Unlimited\' or a number!';
                    return;
                }
                if (memoryLimitFormControl.hasError('min')) {
                    this.formErrMessage = 'Memory limit should be bigger than 0!';
                    return;
                }
                if (memoryLimitFormControl.hasError('max')) {
                    this.formErrMessage = `Memory limit cannot be bigger than ${this.resourceLimits['memory']['maxUsage']} MB!`;
                    return;
                }
            });

        // listen for cpuReservation changes and handle validation errors, only if advanced mode is on
        this.form.get('cpuReservation').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                if (!this.inAdvancedMode) {
                    return;
                }
                const cpuReservationFormControl = this.form.get('cpuReservation');
                if (cpuReservationFormControl.hasError('required')) {
                    this.formErrMessage = 'CPU reservation cannot be empty!';
                    return;
                }
                if (cpuReservationFormControl.hasError('pattern')) {
                    this.formErrMessage = 'CPU reservation should be numberic!';
                    return;
                }
                if (cpuReservationFormControl.hasError('min')) {
                    this.formErrMessage = 'CPU reservation should be bigger than 0!';
                    return;
                }
                if (cpuReservationFormControl.hasError('max')) {
                    this.formErrMessage = `CPU reservation cannot be bigger than ${this.resourceLimits['cpu']['unreservedForPool']} MHz!`;
                    return;
                }
            });

        // listen for memoryReservation changes and handle validation errors, only if advanced mode is on
        this.form.get('memoryReservation').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                if (!this.inAdvancedMode) {
                    return;
                }
                const memoryReservationFormControl = this.form.get('memoryReservation');
                if (memoryReservationFormControl.hasError('required')) {
                    this.formErrMessage = 'Memory limit cannot be empty!';
                    return;
                }
                if (memoryReservationFormControl.hasError('pattern')) {
                    this.formErrMessage = 'Memory limit should be numberic!';
                    return;
                }
                if (memoryReservationFormControl.hasError('min')) {
                    this.formErrMessage = 'Memory limit should be bigger than 0!';
                    return;
                }
                if (memoryReservationFormControl.hasError('max')) {
                    this.formErrMessage = `Memory limit cannot be bigger than ${this.resourceLimits['memory']['unreservedForPool']} MB!`;
                    return;
                }
            });

        // listen for endpointCpu changes and handle validation errors, only if advanced mode is on
        this.form.get('endpointCpu').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                if (!this.inAdvancedMode) {
                    return;
                }
                const endpointCpuFormControl = this.form.get('endpointCpu');
                if (endpointCpuFormControl.hasError('required')) {
                    this.formErrMessage = 'CPU limit cannot be empty!';
                    return;
                }
                if (endpointCpuFormControl.hasError('pattern')) {
                    this.formErrMessage = 'CPU limit should be numberic!';
                    return;
                }
                if (endpointCpuFormControl.hasError('min')) {
                    this.formErrMessage = 'CPU limit should be bigger than 0!';
                    return;
                }
            });

        // listen for endpointMemory changes and handle validation errors, only if advanced mode is on
        this.form.get('endpointMemory').statusChanges
            .debounce(() => Observable.timer(250))
            .subscribe(v => {
                if (!this.inAdvancedMode) {
                    return;
                }
                const endpointMemoryFormControl = this.form.get('endpointMemory');
                if (endpointMemoryFormControl.hasError('required')) {
                    this.formErrMessage = 'Memory limit cannot be empty!';
                    return;
                }
                if (endpointMemoryFormControl.hasError('pattern')) {
                    this.formErrMessage = 'Memory limit should be numberic!';
                    return;
                }
                if (endpointMemoryFormControl.hasError('min')) {
                    this.formErrMessage = 'Memory limit should be bigger than 0!';
                    return;
                }
                if (endpointMemoryFormControl.hasError('max')) {
                    this.formErrMessage = `Memory limit cannot be bigger than ${this.resourceLimits['memory']['maxUsage']} MB!`;
                    return;
                }
            });

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
            errs.push('Please choose a valid compute resource!');
            formErrors = { invalidComputeResource: true };
        }

        this.form.setErrors(formErrors);
        if (formErrors) {
            return Observable.throw(errs);
        } else {
            const cpuLimitValue = this.form.get('cpuLimit').value;
            const memoryLimitValue = this.form.get('memoryLimit').value;

            results['computeResource'] = this.selectedComputeResource;
            results['cpu'] = unlimitedRegexPattern.test(cpuLimitValue) ? '0' : cpuLimitValue;
            results['memory'] = unlimitedRegexPattern.test(memoryLimitValue) ? '0' : memoryLimitValue;
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
