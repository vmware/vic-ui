import {
  Component, Input, OnInit, QueryList,
  ViewChildren
} from '@angular/core';
import {VchUiCompute} from '../../../interfaces/vch';
import {ComputeResource} from '../../../interfaces/compute.resource';
import {FormBuilder, Validators} from '@angular/forms';
import {ServerInfo} from '../../vSphereClientSdkTypes';
import {flattenArray} from '../../utils/array-utils';
import {getNumericValidatorsArray, unlimitedPattern} from '../../utils/validators';
import {Observable} from 'rxjs/Observable';
import {CreateVchWizardService} from '../../../create-vch-wizard/create-vch-wizard.service';
import {getMorIdFromObjRef} from '../../utils/object-reference';
import {DC_CLUSTER} from '../../constants';
import {GlobalsService} from '../../globals.service';
import {ComputeResourceTreenodeComponent} from './compute-resource-treenode.component';
import {
  ConfigureVchService,
  SelectedComputeResourceInfo
} from '../../../configure/configure-vch.service';
import {VchComponentBase} from '../vch-component-base';

const endpointMemoryDefaultValue = 2048;

@Component({
  selector: 'vic-vch-compute',
  templateUrl: './vch-compute.component.html',
  styleUrls: ['./vch-compute.component.scss']
})
export class VchComputeComponent extends VchComponentBase implements OnInit {

  @Input() model: VchUiCompute;

  public datacenter: any[] = [];
  public dcObj: ComputeResource;
  public serviceGuid: string;
  public clusters: any[] = [];
  public resources: any[] = [];
  public isTreeLoading = false;
  public inAdvancedMode = false;
  public isCluster: boolean;
  public resourceLimits: any = {
    cpu: { maxUsage: null, minUsage: null, unreservedForPool: null },
    memory: { maxUsage: null, minUsage: null, unreservedForPool: null }
  };
  public selectedObjectName: string;
  public selectedResourceObjRef: string;
  public serversInfo: ServerInfo[];
  public selectedComputeResourceInfo: Observable<SelectedComputeResourceInfo>;
  public resourceObjForResourceAllocations: string;

  private _selectedComputeResource: string;
  protected readonly initialModel: VchUiCompute = {
    cpuLimit: 'Unlimited',
    memoryLimit: 'Unlimited',
    cpuReservation: 1,
    cpuShares: 'normal',
    memoryShares: 'normal',
    memoryReservation: 1,
    endpointCpu: 1,
    endpointMemory: endpointMemoryDefaultValue,
    computeResource: null
  };

  @ViewChildren(ComputeResourceTreenodeComponent)
  treenodeComponents: QueryList<ComputeResourceTreenodeComponent>;

  constructor(
    protected formBuilder: FormBuilder,
    protected createWzService: CreateVchWizardService,
    protected globalsService: GlobalsService,
    protected configureService: ConfigureVchService
  ) {
    super(formBuilder, createWzService, globalsService, configureService);
    this.setFormValues(this.initialModel);
  }

  // TODO: add units selectors to compute fields

  ngOnInit() {
    this.serversInfo = this.globalsService
      .getWebPlatform()
      .getUserSession()
      .serversInfo;

    const obsArr = this.serversInfo
      .map(serverInfo => this.createWzService
      .getDatacenter(serverInfo.serviceGuid));

    Observable.zip(...obsArr)
      .subscribe(results => {
        this.datacenter = flattenArray(results);
      });

    if (this.model) {
      if (this.model.cpuReservation) {
        this.inAdvancedMode = true;
      }
      if (this.model.computeResource) {
        this.selectedComputeResourceInfo = this.configureService
          .loadSelectedComputeResourceInfo(this.serversInfo, this.model.computeResource)
          .do((data: SelectedComputeResourceInfo) => {
            this.selectComputeResource({
              obj: data.obj,
              datacenterObj: data.datacenterObj
            })
          })
      }
    }

    super.ngOnInit();
  }

  setFormValues(model: VchUiCompute) {
    // create a FormGroup instance
    this.form = this.formBuilder.group({
      cpuLimit: [model.cpuLimit || this.initialModel.cpuLimit,
        getNumericValidatorsArray(true)],
      memoryLimit: [model.memoryLimit || this.initialModel.memoryLimit,
        getNumericValidatorsArray(true)],
      cpuReservation: [model.cpuReservation || this.initialModel.cpuReservation,
        getNumericValidatorsArray(false)],
      memoryReservation: [model.memoryReservation || this.initialModel.memoryReservation,
        getNumericValidatorsArray(false)],
      endpointCpu: [model.endpointCpu || this.initialModel.endpointCpu,
        getNumericValidatorsArray(false)],
      endpointMemory: [model.endpointMemory || endpointMemoryDefaultValue,
        getNumericValidatorsArray(false)],
      // TODO: make cpuShares and memoryShares required on advanced mode
      cpuShares: model.cpuShares || this.initialModel.cpuShares,
      memoryShares: model.memoryShares || this.initialModel.memoryShares
    });

    if (this.model) {
      this.updateCurrentModel();
    }

  }

  updateCurrentModel() {
    if (this.form.valid) {
      if (this.inAdvancedMode) {
        this.model = {...this.form.value}
      } else {
        this.model = {
          cpuLimit: this.form.value.cpuLimit,
          memoryLimit: this.form.value.memoryLimit,
        }
      }

      // override cpu and memory limits in case of unlimiteds
      const cpuLimitValue = this.form.get('cpuLimit').value;
      const memoryLimitValue = this.form.get('memoryLimit').value;
      this.model.cpuLimit = unlimitedPattern.test(cpuLimitValue) ? this.initialModel.cpuLimit : cpuLimitValue;
      this.model.memoryLimit = unlimitedPattern.test(memoryLimitValue) ? this.initialModel.memoryLimit : memoryLimitValue;

      if (this._selectedComputeResource) {
        this.model.computeResource = this.selectedComputeResource;
      }
      this.emitCurrentModel();
    }
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
   * @param {obj: ComputeResource; parentClusterObj?: ComputeResource; datacenterObj: ComputeResource}
   */
  selectComputeResource(payload: {
    obj: ComputeResource | any;
    parentClusterObj?: ComputeResource | any;
    datacenterObj: ComputeResource | any
  }) {
    const nodeTypeId = payload.obj.nodeTypeId;
    const resourceObj = payload.obj.objRef;
    const dcObj = payload.datacenterObj.objRef;
    this.dcObj = payload.datacenterObj;
    this.isCluster = nodeTypeId === DC_CLUSTER;
    this.resourceObjForResourceAllocations = resourceObj;

    let computeResource = `/${this.dcObj.text}/host`;

    if (this.isCluster) {
      computeResource = `${computeResource}/${payload.obj.text}`;
      this.resourceObjForResourceAllocations = payload.obj.aliases[0];
    } else {
      computeResource = payload.parentClusterObj ?
        `${computeResource}/${payload.parentClusterObj.text}/${payload.obj.text}` :
        `${computeResource}/${payload.obj.text}`;
    }

    this.selectedResourceObjRef = resourceObj;
    this.selectedObjectName = payload.obj.text;
    this._selectedComputeResource = computeResource;

    // set active class on the treenodecomponent whose datacenter object reference is
    // the same as datacenterObj.objRef
    if (this.treenodeComponents) {
      this.treenodeComponents
        .filter(component => component.datacenter.objRef !== dcObj)
        .forEach(component => {
          component.unselectComputeResource();
        });
    }

    // update resource limit & reservation info
    this.updateValidatorsAndInfos();
    this.updateCurrentModel();
  }

  updateValidatorsAndInfos() {
    if (this.resourceObjForResourceAllocations) {
      this.createWzService.getResourceAllocationsInfo(this.resourceObjForResourceAllocations, this.isCluster)
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
    }
  }

  onCommit(): Observable<{computeCapacity: VchUiCompute}> {
    const errs: string[] = [];
    let formErrors = null;

    if (!this.isConfigure && !this.selectedComputeResource) {
      errs.push('Please choose a valid compute resource');
      formErrors = { invalidComputeResource: true };
    }

    this.form.setErrors(formErrors);

    if (this.form.invalid) {
      return Observable.throw(errs);
    } else {
      return Observable.of({ computeCapacity: this.model });
    }
  }

  isValid(): boolean {
    return this._selectedComputeResource && super.isValid();
  }

  toggleAdvancedMode() {
    this.inAdvancedMode = !this.inAdvancedMode;
    this.updateValidatorsAndInfos();
    this.updateCurrentModel();
  }

  getDcs (serverInfo: ServerInfo): ComputeResource[] {
    return this.datacenter.filter((item: ComputeResource) => item.objRef.indexOf(serverInfo.serviceGuid) > -1);
  }

  getDataCenterId (dcObj: string) {
    const dcIds = dcObj.split(':');
    if (dcIds[2] === 'Datacenter') {
      // e.g: urn:vmomi:Datacenter:dc-test:00000000-0000-0000-0000-000000000000
      return dcIds[3];
    }
  }

  get selectedComputeResource() {
    return this._selectedComputeResource;
  }

  get dcId () {
    return getMorIdFromObjRef(this.dcObj.objRef);
  }


}
