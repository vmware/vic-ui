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

import {ClarityModule} from '@clr/angular';
import {ComputeCapacityComponent} from './compute-capacity.component';
import {ComputeResourceTreenodeComponent} from './compute-resource-treenode.component';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {HttpModule} from '@angular/http';
import {Observable, of } from 'rxjs';
import {ReactiveFormsModule} from '@angular/forms';
import {AppAlertService, GlobalsService, I18nService} from '../../shared';
import {mockedDcClustersAndStandAloneHostsList} from '../mocks/create-vch-wizard-mocked-data';

describe('ComputeCapacityComponent', () => {

  let component: ComputeCapacityComponent;
  let fixture: ComponentFixture<ComputeCapacityComponent>;
  let service: CreateVchWizardService;

  const MaxLimit = 4096;

  function setDefaultRequiredValues() {
    component.resources = mockedDcClustersAndStandAloneHostsList;
    component.selectComputeResource({datacenterObj: component.datacenter, obj: component.resources[0]});
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      providers: [
        AppAlertService,
        I18nService,
        {
          provide: CreateVchWizardService,
          useValue: {
            getDatacenter() {
              return of([{
                text: 'datacenter'
              }]);
            },
            getDcClustersAndStandAloneHosts(serviceGuid: string) {
              return of([{
                text: 'cluster'
              }]);
            },
            getResourceAllocationsInfo() {
              return of({
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
              return of([{
                text: 'cluster',
                nodeTypeId: 'DcCluster',
                aliases: ['cluster']
              }]);
            },
            getClusterVMGroups() {
              return of([]);
            },
            getClusterDrsStatus() {
              return of([]);
            }
          }
        },
        {
          provide: GlobalsService,
          useValue: {
            getWebPlatform () {
              return {
                getUserSession () {
                  return {
                    serversInfo: [{
                      name: 'server.vpshere.local',
                      serviceGuid: 'aaaa-bbb-ccc',
                      thumbprint: 'AA:BB:CC'
                    }]
                  }
                }
              }
            }
          }
        }
      ],
      declarations: [
        ComputeCapacityComponent,
        ComputeResourceTreenodeComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputeCapacityComponent);
    component = fixture.componentInstance;

    spyOn(component, 'onPageLoad').and.callFake(() => {
      component.clusters = [{
        text: 'cluster',
        nodeTypeId: 'DcCluster',
        aliases: ['cluster']
      }];
    });
    component.onPageLoad();

    service = fixture.debugElement.injector.get(CreateVchWizardService);

    spyOn(service, 'getDatacenter').and.callThrough();
    spyOn(service, 'getResourceAllocationsInfo').and.callThrough();
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
    component.selectComputeResource({datacenterObj: component.datacenter, obj: mockedDcClustersAndStandAloneHostsList[0]});
    component.onCommit();
    expect(component.form.valid).toBe(true);

    component.form.get('cpuReservation').setValue('');
    expect(component.form.get('cpuReservation').hasError('required')).toBeTruthy();

    component.form.get('cpuReservation').setValue('test');
    expect(component.form.get('cpuReservation').hasError('pattern')).toBeTruthy();
  });

  it('should validate if selected element is a Cluster', () => {
    spyOn(service, 'getClusterVMGroups').and.callThrough();
    spyOn(service, 'getClusterDrsStatus').and.callThrough();

    component.toggleAdvancedMode();
    component.selectComputeResource({datacenterObj: component.datacenter, obj: {text: 'new Cluster 1', nodeTypeId: 'DcStandaloneHost'}});
    expect(component.selectedResourceIsCluster).toBeFalsy();

    component.selectComputeResource(
      {datacenterObj: component.datacenter, obj: {text: 'New Cluster 1', nodeTypeId: 'DcCluster', aliases: ['']}});
    expect(component.selectedResourceIsCluster).toBeTruthy();
  });

  it('should validate if Cluster has DRS option enabled or disabled', () => {
    spyOn(service, 'getClusterVMGroups').and.callThrough();
    const drsStatusSpy = spyOn(service, 'getClusterDrsStatus');

    drsStatusSpy.and.returnValue(of(true));
    component.toggleAdvancedMode();
    component.selectComputeResource(
      {datacenterObj: component.datacenter, obj: {text: 'New Cluster 1', nodeTypeId: 'DcCluster', aliases: ['']}});
    expect(component.isClusterDrsEnabled).toBeTruthy();

    drsStatusSpy.and.returnValue(of(false));
    component.toggleAdvancedMode();
    component.selectComputeResource(
      {datacenterObj: component.datacenter, obj: {text: 'New Cluster 1', nodeTypeId: 'DcCluster', aliases: ['']}});
    expect(component.isClusterDrsEnabled).toBeFalsy();
  });

  it('should validate if Cluster VM Host Group Name already exists', () => {
    component.vchName = 'test';

    spyOn(service, 'getClusterDrsStatus').and.returnValue(of(true));
    const clusterVMGroups = spyOn(service, 'getClusterVMGroups');

    clusterVMGroups.and.returnValue(of([{'ClusterComputeResource/configurationEx/group': []}]));
    component.toggleAdvancedMode();
    component.selectComputeResource(
      {datacenterObj: component.datacenter, obj: {text: 'New Cluster 1', nodeTypeId: 'DcCluster', aliases: ['']}});
      expect(component.vmGroupNameIsValid).toBeTruthy();
    clusterVMGroups.and.returnValue(of([{'ClusterComputeResource/configurationEx/group': [{name: 'test'}]}]));
    component.toggleAdvancedMode();
    component.selectComputeResource(
      {datacenterObj: component.datacenter, obj: {text: 'New Cluster 1', nodeTypeId: 'DcCluster', aliases: ['']}});
    expect(component.vmGroupNameIsValid).toBeTruthy();
  });

});
