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
  private selectorImageStore = 'select#image-store-selector';
  private selectorBridgeNetwork = 'select#bridge-network-selector';
  private selectorPublicNetwork = 'select#public-network-selector';
  private inputUsername = '#username';
  private username = 'administrator@vsphere.local';
  private inputPassword = '#password';
  private password = 'Admin!23';
  private submit = '#submit';
  private defaultTimeout = 5000;

  navigateTo() {
    browser.waitForAngularEnabled(false);
    return browser.get('https://localhost:9443');
  }

  login() {
    browser.waitForAngularEnabled(false);
    // username
    browser.driver.findElement(by.css(this.inputUsername)).click();
    browser.driver.findElement(by.css(this.inputUsername)).clear();
    browser.driver.findElement(by.css(this.inputUsername)).sendKeys(this.username);
    // password
    browser.driver.findElement(by.css(this.inputPassword)).click();
    browser.driver.findElement(by.css(this.inputPassword)).clear();
    browser.driver.findElement(by.css(this.inputPassword)).sendKeys(this.password);
    // submit
    browser.driver.findElement(by.css(this.submit)).click();
  }

  navigateToHome() {
    // click top left vmware logo
    this.waitForElementToBePresent(this.iconVsphereHome);
    browser.driver.findElement(by.css(this.iconVsphereHome)).click();
  }

  navigateToVicPlugin() {
    // click vic shortcut icon
    browser.driver.findElement(by.css(this.iconVicShortcut)).click();
  }

  navigateToSummaryTab() {
    // click vic link
    this.waitForElementToBePresent(this.iconVicRoot);
    browser.driver.findElement(by.css(this.iconVicRoot)).click();
  }

  navigateToVchTab() {
    // click vch tab
    element(by.cssContainingText('a', 'Virtual Container Hosts')).click();
  }

  openVchWizard() {
    browser.switchTo().frame(browser.driver.findElement(by.css(this.iframeTabs)));
    this.waitForElementToBePresent(this.buttonNewVch);
    browser.driver.findElement(by.css(this.buttonNewVch)).click();
    browser.switchTo().defaultContent();
    browser.switchTo().frame(browser.driver.findElement(by.css(this.iframeModal)));
  }

  selectComputeResource() {
    this.waitForElementToBePresent(this.buttonComputeResource);
    browser.driver.findElement(by.css(this.buttonComputeResource)).click();
  }

  selectDatastore() {
    this.waitForElementToBePresent(this.selectorImageStore);
    browser.driver.findElement(by.css(this.selectorImageStore + ' option:nth-child(3)')).click();
  }

  selectBridgeNetwork() {
    this.waitForElementToBePresent(this.selectorBridgeNetwork);
    browser.driver.findElement(by.css(this.selectorBridgeNetwork + ' option:nth-child(2)')).click();
  }

  selectPublicNetwork() {
    this.waitForElementToBePresent(this.selectorPublicNetwork);
    browser.driver.findElement(by.css(this.selectorPublicNetwork + ' option:nth-child(3)')).click();
  }

  disableSecureAccess() {
    this.waitForElementToBePresent(this.labelEnableSecure);
    browser.driver.findElement(by.css(this.labelEnableSecure)).click();
  }

  enterOpsUserCreds() {
    browser.waitForAngularEnabled(false);
    // username
    browser.driver.findElement(by.css(this.inputOpsUser)).click();
    browser.driver.findElement(by.css(this.inputOpsUser)).sendKeys(this.username);
    // password
    browser.driver.findElement(by.css(this.inputOpsPassword)).click();
    browser.driver.findElement(by.css(this.inputOpsPassword)).sendKeys(this.password);
  }

  createVch() {
    this.clickButton('Finish');
    browser.sleep(10000);
    this.clickButton('Cancel');
    browser.switchTo().defaultContent();
    browser.switchTo().frame(browser.driver.findElement(by.css(this.iframeTabs)));
    browser.sleep(10000);
  }

  deleteVch(vch) {
    browser.ignoreSynchronization = true;
    this.waitForElementToBePresent(this.actionBar + vch);
    browser.driver.findElement(by.css(this.actionBar + vch)).click();
    browser.driver.findElement(by.css('button.' + vch)).click();
    browser.sleep(this.defaultTimeout);
    browser.switchTo().defaultContent();
    browser.switchTo().frame(browser.driver.findElement(by.css(this.iframeModal)));
    browser.sleep(this.defaultTimeout);
    this.clickButton('Delete');
    browser.sleep(this.defaultTimeout);
  }

  clickButton(text) {
    browser.sleep(1000);
    element(by.cssContainingText('button', text)).click();
  }

  clickByCSS(el) {
    element(by.css(el)).isPresent().then(function(result) {
      if ( result ) {
        browser.driver.findElement(by.css(el)).click();
      } else {
        return false;
      }
    });
  }

  waitForElementToBePresent(element) {
    browser.wait(function () {
      return browser.isElementPresent(by.css(element));
    }, 5000);
  };

}
