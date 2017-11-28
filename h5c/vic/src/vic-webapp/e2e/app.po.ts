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
    this.waitForElementToBePresent(this.buttonComputeResource);
    this.clickByCSS(this.buttonComputeResource);
  }

  selectDatastore() {
    this.waitForElementToBePresent(this.selectorImageStore);
    this.clickByCSS(this.selectorImageStore + ' option:nth-child(3)');
  }

  selectBridgeNetwork() {
    this.waitForElementToBePresent(this.selectorBridgeNetwork);
    this.clickByCSS(this.selectorBridgeNetwork + ' option:nth-child(2)');
  }

  selectPublicNetwork() {
    this.waitForElementToBePresent(this.selectorPublicNetwork);
    this.clickByCSS(this.selectorPublicNetwork + ' option:nth-child(3)');
  }

  disableSecureAccess() {
    this.waitForElementToBePresent(this.labelEnableSecure);
    this.clickByCSS(this.labelEnableSecure);
  }

  enterOpsUserCreds() {
    browser.waitForAngularEnabled(false);
    // username
    this.clickByCSS(this.inputOpsUser);
    this.sendKeys(this.inputOpsUser, this.username);
    // password
    this.clickByCSS(this.inputOpsPassword);
    this.sendKeys(this.inputOpsPassword, this.password);
  }

  createVch() {
    this.clickByText('Button', 'Finish');
    browser.sleep(this.extendedTimeout);
    this.clickByText('Button', 'Cancel');
    browser.switchTo().defaultContent();
    this.switchFrame(this.iframeTabs);
    browser.sleep(this.extendedTimeout);
  }

  deleteVch(vch) {
    browser.ignoreSynchronization = true;
    this.waitForElementToBePresent(this.actionBar + vch);
    this.clickByCSS(this.actionBar + vch);
    this.clickByCSS('button.' + vch);
    browser.sleep(this.defaultTimeout);
    browser.switchTo().defaultContent();
    this.switchFrame(this.iframeModal);
    this.clickByCSS(this.labelDeleteVolumes);
    browser.sleep(this.defaultTimeout);
    this.clickByText('Button', 'Delete');
    browser.sleep(this.defaultTimeout);
  }

  /* Utility functions */

  clickByText(el, text) {
    element(by.cssContainingText(el, text)).isPresent().then(function(result) {
      if (result) {
        element(by.cssContainingText(el, text)).click();
      } else {
        return false;
      }
    });
  }

  clickByCSS(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).click();
      } else {
        return false;
      }
    });
  }

  clear(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).clear();
      } else {
        return false;
      }
    });
  }

  sendKeys(el, keys) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.css(el)).sendKeys(keys);
      } else {
        return false;
      }
    });
  }

  switchFrame(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if (result) {
        browser.switchTo().frame(browser.driver.findElement(by.css(el)));
      } else {
        return false;
      }
    });
  }

  waitForElementToBePresent(element) {
    browser.wait(function () {
      return browser.isElementPresent(by.css(element));
    }, this.defaultTimeout);
  };

}
