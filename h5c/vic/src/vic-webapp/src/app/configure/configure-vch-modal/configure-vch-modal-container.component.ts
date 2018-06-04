/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

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

import {
  Component, ContentChild, ElementRef, Input, OnInit,
  Renderer,
  ViewChild
} from '@angular/core';
import {GlobalsService} from '../../shared/globals.service';
import {Modal} from '@clr/angular';
import {ActivatedRoute} from '@angular/router';
import {
  Vch,
  VchView,
  VchViewTypes
} from '../../interfaces/vch';
import {Observable} from 'rxjs/Observable';
import {ConfigureVchService} from '../configure-vch.service';
import {vchViewToVch} from '../../shared/utils/vch/vch-utils';
import {HttpErrorResponse} from '@angular/common/http';
import {resizeModalToParentFrame} from '../../shared/utils/modal-resize';
import {CONFIGURE_VCH_MODAL_HEIGHT} from '../../shared/constants/configure-vch-modal';
import {VchComponentBase} from '../../shared/components/vch-component-base';

export type VchConfigureContents = VchComponentBase;

@Component({
  selector: 'vic-configure-vch-modal-container',
  styleUrls: ['configure-vch-modal-container.component.scss'],
  templateUrl: './configure-vch-modal-container.component.html'
})
export class ConfigureVchModalContainerComponent implements OnInit {

  @Input() title: string;
  @Input() vchId: string;
  @Input() helpLink: string;
  @Input() modelChangedPayload: Observable<VchViewTypes>;

  @ViewChild('modal') modal: Modal;
  @ContentChild('configureContent') currentContent: VchConfigureContents;

  public errorMsgs: string[];
  public loading = false;
  public errorFlag = false;

  constructor(private globalsService: GlobalsService,
              private activatedRoute: ActivatedRoute,
              private configureVchService: ConfigureVchService,
              private renderer: Renderer,
              private elRef: ElementRef) {
  }

  ngOnInit() {
    resizeModalToParentFrame(this.renderer, this.elRef, `${CONFIGURE_VCH_MODAL_HEIGHT}px`);
    this.modal.open();
  }

  /**
   * Close the H5 Client modal
   */
  onCancel() {
    const webPlatform = this.globalsService.getWebPlatform();
    webPlatform.closeDialog();
  }

  /**
   * TODO: Implement API PATCH request
   */
  onSave() {
    if (this.currentContent) {
      this.errorFlag = false;
      this.loading = true;
      this.currentContent.onCommit()
        .switchMap((payload: VchView) => {
          const vch: Vch = vchViewToVch(payload);
          return this.configureVchService.patchVch(this.vchId, vch);
        })
        .subscribe(
          (payload: Vch) => {
            this.errorFlag = false;
            this.loading = false;
            this.onCancel();
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.errorFlag = true;
            this.errorMsgs = Array.isArray(error) ? error : [error.message];
          }
        )
    }
  }

  /**
   * Validates if the current VCH component content is valid or not in order to
   * enable or disable the save and cli copy buttons
   * @returns {boolean}
   */
  isCurrentContentInvalid(): boolean {
    return !this.currentContent || !this.currentContent.isValid();
  }

}
