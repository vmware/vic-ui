import {Component, OnInit} from '@angular/core';
import {globalProperties} from '../../../../environments/properties';
import {ConfigureVchBase} from '../../configure-vch-base';
import {GlobalsService} from '../../../shared/globals.service';
import {ConfigureVchService, SelectedComputeResourceInfo} from '../../configure-vch.service';
import {ActivatedRoute} from '@angular/router';
import {VchUi} from '../../../interfaces/vch';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'vic-configure-vch-modal-storage',
  templateUrl: './configure-vch-modal-storage.component.html',
  styleUrls: ['./configure-vch-modal-storage.component.scss']
})
export class ConfigureVchModalStorageComponent extends ConfigureVchBase implements OnInit {

  public helpLink = globalProperties.vhcDocsGeneral;
  public resourceObjRefObs: Observable<{vchUIModel: VchUi, resourceObjRef: string}>;

  constructor(protected globalsService: GlobalsService,
              protected configureVchService: ConfigureVchService,
              protected activatedRoute: ActivatedRoute) {
    super(globalsService, configureVchService, activatedRoute);
  }

  ngOnInit() {
    super.ngOnInit();

    const serversInfo = this.globalsService
      .getWebPlatform()
      .getUserSession()
      .serversInfo;

    this.resourceObjRefObs = this.vchInfo
      .switchMap((vchInfo: VchUi) => {
        return this.configureVchService
          .loadSelectedComputeResourceInfo(serversInfo, vchInfo.computeCapacity.computeResource)
          .map((resourceInfo: SelectedComputeResourceInfo) => ({vchUIModel: vchInfo, resourceObjRef: resourceInfo.obj.objRef}))
      })
  }

}
