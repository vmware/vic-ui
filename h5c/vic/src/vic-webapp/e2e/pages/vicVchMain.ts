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

'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import {
    defaultTimeout,
    opsTimeout,
    modalWizard,
    namePrefix,
    extendedTimeout,
    iframeTabs
  } from './common';
import { VchCreateUpdate } from './vicVchCreateUpdate';
import { VicVchDetails } from './vicVchDetails';

export class VicVchMain extends VicWebappPage {

    private iconVicRoot = 'span[title="vSphere Integrated Containers"]:last-of-type';
    private objectTab = '.tabbed-object-view';
    private buttonVchsTab = 'li.tid-com-vmware-vic-customtab-vch-navi-tab-header a';
    private iframeTabs = 'div.outer-tab-content iframe.sandbox-iframe';
    private buttonNewVch = 'button.new-vch';
    private iframeModal = 'div.modal-body iframe.sandbox-iframe';
    private dataGridCell = '.datagrid-cell';
    private actionBar = 'clr-dg-action-overflow.';
    private labelDeleteVolumes = 'label[for=delete-volumes]';

    navigateToSummaryTab() {
         browser.sleep(defaultTimeout);
         this.waitForElementToBePresent(this.iconVicRoot);
         this.clickByCSS(this.iconVicRoot);
    }

    navigateToVchTab() {
        browser.sleep(4000);
        this.waitForElementToBePresent(this.objectTab);
        browser.sleep(4000);
        this.waitForElementToBePresent(this.buttonVchsTab);
        browser.sleep(4000);
        this.clickByCSS(this.buttonVchsTab);
        browser.wait(() => {
          return browser.getCurrentUrl().then(v => {
            browser.sleep(6000);
            return v.indexOf('customtab-vch') > -1;
          });
        }, opsTimeout);
    }

    navigateToCreateWizard() {
        this.switchFrame(this.iframeTabs);
        this.waitForElementToBePresent(this.buttonNewVch)
        this.clickByCSS(this.buttonNewVch);
        browser.switchTo().defaultContent();
        this.switchFrame(this.iframeModal);
        this.waitForElementToBePresent(modalWizard);
        return new VchCreateUpdate();
    }

    navigateToVchVmDetails(specRunId) {
      browser.switchTo().defaultContent();
      this.switchFrame(this.iframeTabs);
      this.waitForElementToBePresent(this.actionBar + namePrefix + specRunId);
      this.clickByText('.datagrid-cell a', namePrefix + specRunId);
      return new VicVchDetails();
    }

    checkVchOnDataGrid(specRunId) {
      return this.waitForElementToBePresent(this.actionBar + namePrefix + specRunId);
    }

    checkVchStarted(specRunId) {
      browser.switchTo().defaultContent();
      return this.waitForTaskDone(namePrefix + specRunId, 'Reconfigure virtual machine');
    }

    deleteVch(specRunId) {
      this.switchFrame(this.iframeTabs);
      this.waitForElementToBePresent(this.actionBar + namePrefix + specRunId);
      const vchActionMenu = this.actionBar + namePrefix + specRunId;
      this.clickByCSS(vchActionMenu);
      this.clickByCSS(vchActionMenu + ' button.action-item-delete');
      browser.switchTo().defaultContent();
      this.waitForElementToBePresent(this.iframeModal);
      this.switchFrame(this.iframeModal);
      // wait for modal to set position
      this.waitForElementToBePresent(this.labelDeleteVolumes);
      this.clickByCSS(this.labelDeleteVolumes);
      this.clickByText('Button', 'Delete');
      browser.switchTo().defaultContent();
    }

    checkVchDeleted(specRunId) {
      let vchFound = false;
      this.switchFrame(iframeTabs);
      const vchClrDgActionXpath = `//clr-dg-action-overflow[contains(@class, '${namePrefix + specRunId}')]`;
      element(by.xpath(vchClrDgActionXpath)).isPresent().then(present => {
        vchFound = present;
      });

      browser.sleep(defaultTimeout);
      browser.switchTo().defaultContent();
      this.waitForTaskDone(namePrefix + specRunId, 'Delete resource pool');
      }
}
