import {Component, Input} from '@angular/core';
import {
  CONFIGURE_VCH_MODAL_WIDTH, CONFIGURE_VCH_MODAL_HEIGHT, CONFIGURE_VCH_MODAL_COMPUTE_URL,
  CONFIGURE_VCH_MODAL_GENERAL_URL, CONFIGURE_VCH_MODAL_STORAGE_URL, CONFIGURE_VCH_MODAL_NETWORK_URL
} from '../../shared/constants/configure-vch-modal';
import {VchUiModelKeys} from '../../interfaces/vch';
import {GlobalsService} from '../../shared';

@Component({
  selector: 'vic-configure-vch-view-container',
  templateUrl: './configure-vch-view-container.component.html',
  styleUrls: ['./configure-vch-view-container.component.scss']
})
export class ConfigureVchViewContainerComponent {

  @Input() title: string;
  @Input() vchId: string;
  @Input() vchUiModelKey: VchUiModelKeys;

  constructor(protected globalsService: GlobalsService) {}

  /**
   * Launches the corresponding configure modal based on the current VchUiModelKeys
   */
  launchVchConfigureModal() {
    let path: string;
    // TODO: add cases for the rest of the tabs
    switch (this.vchUiModelKey) {
      case 'general':
        path = CONFIGURE_VCH_MODAL_GENERAL_URL;
        break;
      case 'computeCapacity':
        path = CONFIGURE_VCH_MODAL_COMPUTE_URL;
        break;
      case 'storageCapacity':
        path = CONFIGURE_VCH_MODAL_STORAGE_URL;
        break;
      case 'networks':
        path = CONFIGURE_VCH_MODAL_NETWORK_URL;
        break;
    }
    if (path) {
      const webPlatform = this.globalsService.getWebPlatform();
      webPlatform.openModalDialog(
        ' ',
        `${path}`,
        CONFIGURE_VCH_MODAL_WIDTH,
        CONFIGURE_VCH_MODAL_HEIGHT,
        this.vchId
      );
    }

  }
}
