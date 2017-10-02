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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ClarityModule} from 'clarity-angular';
import {HttpModule} from '@angular/http';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';
import {ComputeCapacityComponent} from './compute-capacity.component';
import {TestScheduler} from 'rxjs/Rx';

describe('ComputeCapacityComponent', () => {

  let component: ComputeCapacityComponent;
  let fixture: ComponentFixture<ComputeCapacityComponent>;
  let service: CreateVchWizardService;

  const MaxLimit = 4096;

  function setDefaultRequiredValues() {
    component.loadResources(component.clusters[0].text);
    component.selectComputeResource(component.resources[0]);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      providers: [
        {
          provide: CreateVchWizardService,
          useValue: {
            getDatacenter() {
              return Observable.of([{
                text: 'datacenter'
              }]);
            },
            getClustersList() {
              return Observable.of([{
                text: 'cluster'
              }]);
            },
            getResourceAllocationsInfo() {
              return Observable.of({
                cpu: {
                  maxUsage: MaxLimit,
                  unreservedForPool: MaxLimit
                },
                memory: {
                  maxUsage: MaxLimit,
                  unreservedForPool: MaxLimit
                }
              });
            },
            getHostsAndResourcePools() {
              return Observable.of([{
                text: 'cluster',
                nodeTypeId: 'DcCluster',
                aliases: ['cluster']
              }]);
            }
          }
        }
      ],
      declarations: [
        ComputeCapacityComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputeCapacityComponent);
    component = fixture.componentInstance;
    component.onPageLoad();

    service = fixture.debugElement.injector.get(CreateVchWizardService);

    spyOn(service, 'getDatacenter').and.callThrough();
    spyOn(service, 'getClustersList').and.callThrough();
    spyOn(service, 'getResourceAllocationsInfo').and.callThrough();
    spyOn(service, 'getHostsAndResourcePools').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form', () => {
    expect(component.form.valid).toBe(true);
  });

  it('should end with an invalid form on step commit without selecting a compute resource',  () => {
    component.onCommit();
    expect(component.form.invalid).toBe(true);
  });

  it('should end with an valid form on step commit after selecting a compute resource', () => {
    setDefaultRequiredValues();
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should validate cpu limit field', () => {
    const field = component.form.get('cpuLimit');
    let errors;

    expect(field.valid).toBeTruthy();

    // CPU Limit field is required
    field.setValue('');
    errors = field.errors || {};
    expect(errors['required']).toBeTruthy();

    // Set CPU Limit to something incorrect
    field.setValue('test');
    errors = field.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['pattern']).toBeTruthy();

    // Set CPU Limit to something incorrect
    field.setValue('0');
    errors = field.errors || {};
    expect(errors['pattern']).toBeFalsy();
    expect(errors['min']).toBeTruthy();

    // Set CPU Limit to something correct
    field.setValue('1');
    errors = field.errors || {};
    expect(errors['min']).toBeFalsy();

    // Validate result
    setDefaultRequiredValues();
    component.onCommit().subscribe( r => {
      expect(r.computeCapacity.cpu).toBe('1');
    });
  });

  it('should validate memory limit field', () => {
    const field = component.form.get('memoryLimit');
    let errors;

    expect(field.valid).toBeTruthy();

    // CPU Limit field is required
    field.setValue('');
    errors = field.errors || {};
    expect(errors['required']).toBeTruthy();

    // Set CPU Limit to something incorrect
    field.setValue('test');
    errors = field.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['pattern']).toBeTruthy();

    // Set CPU Limit to something incorrect
    field.setValue('0');
    errors = field.errors || {};
    expect(errors['pattern']).toBeFalsy();
    expect(errors['min']).toBeTruthy();

    // Set CPU Limit to something correct
    field.setValue('1');
    errors = field.errors || {};
    expect(errors['min']).toBeFalsy();

    // Validate result
    setDefaultRequiredValues();
    component.onCommit().subscribe( r => {
      expect(r.computeCapacity.memory).toBe('1');
    });
  });

  it('should validate advanced fields defaults values', () => {
    component.toggleAdvancedMode();
    component.selectComputeResource({text: ''});
    component.onCommit();
    expect(component.form.valid).toBe(true);

    component.form.get('cpuReservation').setValue('');
    expect(component.form.get('cpuReservation').hasError('required')).toBeTruthy();

    component.form.get('cpuReservation').setValue('test');
    expect(component.form.get('cpuReservation').hasError('pattern')).toBeTruthy();
  });
});
