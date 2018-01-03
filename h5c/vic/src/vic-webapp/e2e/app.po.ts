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

import { browser, by, element } from 'protractor';

export class VicWebappPage {

  private actionBar = 'clr-dg-action-overflow.';
  private buttonComputeResource = 'button.cc-resource';
  private datacenterTreenodeCaret = 'button.clr-treenode-caret';
  private buttonNewVch = 'button.new-vch';
  private iconVsphereHome = '.clr-vmw-logo';
  private iconVicShortcut = '.com_vmware_vic-home-shortcut-icon';
  private iconVicRoot = '.com_vmware_vic-vic-root-icon';
  private iframeTabs = 'div.outer-tab-content iframe.sandbox-iframe';
  private iframeModal = 'div.modal-body iframe.sandbox-iframe';
  private inputOpsUser = 'input#ops-user';
  private inputOpsPassword = 'input#ops-password';
  private labelEnableSecure = 'label[for=enable-secure-access]';
  private labelDeleteVolumes = 'label[for=delete-volumes]';
  private selectorImageStore = 'select#image-store-selector';
  private selectorBridgeNetwork = 'select#bridge-network-selector';
  private selectorPublicNetwork = 'select#public-network-selector';
  private inputUsername = '#username';
  private username = 'administrator@vsphere.local';
  private inputPassword = '#password';
  private password = 'Admin!23';
  private submit = '#submit';
  private defaultTimeout = 5000;
  private extendedTimeout = 10000;
  private opsTimeout = 60000;

  navigateTo() {
    browser.waitForAngularEnabled(false);
    return browser.get('https://localhost:9443');
  }

  login() {
    browser.waitForAngularEnabled(false);
    // username
    this.clickByCSS(this.inputUsername);
    this.clear(this.inputUsername);
    this.sendKeys(this.inputUsername, this.username);
    // password
    this.clickByCSS(this.inputPassword);
    this.clear(this.inputPassword);
    this.sendKeys(this.inputPassword, this.password);
    // submit
    this.clickByCSS(this.submit);
  }

  waitUntilStable() {
    browser.wait(() => {
      return browser.getCurrentUrl().then(url => {
        return url.indexOf('/ui') > -1;
      });
    }, this.opsTimeout);
  }

  navigateToHome() {
    // click top left vmware logo
    this.waitForElementToBePresent(this.iconVsphereHome);
    this.clickByCSS(this.iconVsphereHome);
  }

  navigateToVicPlugin() {
    // click vic shortcut icon
    this.waitForElementToBePresent(this.iconVicShortcut);
    this.clickByCSS(this.iconVicShortcut);
  }

  navigateToSummaryTab() {
    // click vic link
    this.waitForElementToBePresent(this.iconVicRoot);
    this.clickByCSS(this.iconVicRoot);
  }

  navigateToVchTab() {
    // click vch tab
    this.clickByText('a', 'Virtual Container Hosts');
  }

  openVchWizard() {
    this.switchFrame(this.iframeTabs);
    this.waitForElementToBePresent(this.buttonNewVch);
    this.clickByCSS(this.buttonNewVch);
    browser.switchTo().defaultContent();
    this.switchFrame(this.iframeModal);
  }

  selectComputeResource() {
    this.waitForElementToBePresent(this.datacenterTreenodeCaret);
    this.clickByCSS(this.datacenterTreenodeCaret);
    this.clickByCSS(this.buttonComputeResource);
  }

  selectDatastore() {
    this.waitForElementToBePresent(this.selectorImageStore);
    this.clickByText(this.selectorImageStore + ' option', 'datastore1');
    // this.clickByCSS(this.selectorImageStore + ' option:nth-child(3)');
  }

  selectBridgeNetwork() {
    this.waitForElementToBePresent(this.selectorBridgeNetwork);
    this.clickByText(this.selectorBridgeNetwork + ' option', 'bridge');
  }

  selectPublicNetwork() {
    this.waitForElementToBePresent(this.selectorPublicNetwork);
    this.clickByText(this.selectorPublicNetwork + ' option', 'network');
  }

  disableSecureAccess() {
    this.waitForElementToBePresent(this.labelEnableSecure);
    this.clickByCSS(this.labelEnableSecure);
  }

  enterOpsUserCreds() {
    // username
    this.clickByCSS(this.inputOpsUser);
    this.sendKeys(this.inputOpsUser, this.username);
    // password
    this.clickByCSS(this.inputOpsPassword);
    this.sendKeys(this.inputOpsPassword, this.password);
  }

  createVch() {
    this.clickByText('Button', 'Finish');
    browser.switchTo().defaultContent();
    this.waitForElementToBeGone(this.iframeModal, this.extendedTimeout * 3);
    this.switchFrame(this.iframeTabs);
  }

  deleteVch(vch) {
    this.waitForElementToBePresent(this.actionBar + vch);
    const vchActionMenu = this.actionBar + vch;
    this.clickByCSS(vchActionMenu);
    this.clickByCSS(vchActionMenu + ' button.action-item-delete');
    browser.switchTo().defaultContent();
    this.waitForElementToBePresent(this.iframeModal);
    this.switchFrame(this.iframeModal);
    // wait for modal to set position
    browser.sleep(this.defaultTimeout);
    this.waitForElementToBePresent(this.labelDeleteVolumes);
    this.clickByCSS(this.labelDeleteVolumes);
    this.clickByText('Button', 'Delete');
    browser.sleep(this.defaultTimeout);
  }

  /* Utility functions */

  clickByText(el, text) {
    element(by.cssContainingText(el, text)).isPresent().then(function(result) {
      if (result) {
        element(by.cssContainingText(el, text)).click();
      } else {
        console.log(text + ' not found');
        return false;
      }
    });
  }

  clickByCSS(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).click();
      } else {
        console.log(el + ' not found');
        return false;
      }
    });
  }

  clear(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).clear();
      } else {
        console.log(el + ' not found');
        return false;
      }
    });
  }

  sendKeys(el, keys) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).sendKeys(keys);
      } else {
        console.log(el + ' not found');
        return false;
      }
    });
  }

  switchFrame(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.switchTo().frame(browser.driver.findElement(by.css(el)));
      } else {
        console.log(el + ' not found');
        return false;
      }
    });
  }

  waitForElementToBePresent(el, timeout = this.opsTimeout) {
    browser.wait(function () {
      return browser.isElementPresent(by.css(el));
    }, timeout);
  };

  waitForElementToBeGone(el, timeout = this.opsTimeout) {
    browser.wait(function () {
      return element(by.css(el)).isPresent().then(function(present) {
        return !present;
      });
    }, timeout);
  };
}
