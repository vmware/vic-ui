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

import { browser, by, element, ElementFinder } from 'protractor';
import {defaultTimeout} from './vch-create-wizard/common';

export class VicWebappPage {

  private h5cActionMenuToggle = 'vc-action-menu.tid-control-bar-user-menu';
  private h5cActionMenuLogOut = 'vc-action-menu-item:nth-of-type(3)';
  private actionBar = 'clr-dg-action-overflow.';
  private buttonComputeResource = 'button.cc-resource';
  private datacenterTreenodeCaret = 'button.clr-treenode-caret';
  private firstDcTreenodeCaretXpath = `(//button[contains(@class,'clr-treenode-caret')])[1]/clr-icon[contains(@dir, 'right')]`;
  private buttonBasicAdvance = 'a.btn.btn-link.pl-0';
  private buttonHostAffinity = 'label.text-nowrap';
  private buttonNewVch = 'button.new-vch';
  private iconVsphereHome = '.clr-vmw-logo';
  private iconVicShortcut = '.com_vmware_vic-home-shortcut-icon';
  private iconHostAndClustersShortcut = '.controlcenter-shortcut-icon';
  private iconVicRoot = 'span[title="vSphere Integrated Containers"]:last-of-type';
  private tabBtnVchs = 'li.tid-com-vmware-vic-customtab-vch-navi-tab-header a';
  private latestTask = 'recent-tasks-view tbody tr:nth-of-type(1)';
  private iframeTabs = 'div.outer-tab-content iframe.sandbox-iframe';
  private iframeModal = 'div.modal-body iframe.sandbox-iframe';
  private inputOpsUser = 'input#ops-user';
  private inputOpsPassword = 'input#ops-password';
  private labelEnableSecure = 'label[for=use-client-auth]';
  private labelDeleteVolumes = 'label[for=delete-volumes]';
  private selectorImageStore = 'select#image-store-selector';
  private selectorBridgeNetwork = 'select#bridge-network-selector';
  private selectorPublicNetwork = 'select#public-network-selector';
  private inputUsername = '#username';
  private username = 'administrator@vsphere.local';
  private inputPassword = '#password';
  private password = 'Bl*ckwalnut0';
  private submit = '#submit';
  private defaultTimeout = 10000;
  private extendedTimeout = 10000;
  private opsTimeout = 80000;

  navigateTo() {
    browser.waitForAngularEnabled(false);
    return browser.get('https://localhost:9443');
  }

  login() {
    browser.waitForAngularEnabled(false);
    // username
    this.waitForElementToBePresent(this.inputUsername);
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

  logOut() {
    this.clickByCSS(this.h5cActionMenuToggle);
    this.waitForElementToBePresent(this.h5cActionMenuLogOut);
    this.clickByCSS(this.h5cActionMenuLogOut);
  }

  waitLoginFinish() {
    this.waitUntilUrlContains('serverObjectViewsExtension');
  }

  waitUntilUrlContains(str: string) {
    browser.wait(() => {
      return browser.getCurrentUrl().then(url => {
        return url.indexOf(str) > -1;
      });
    }, this.opsTimeout);
  }

  navigateToHome() {
    // click top left vmware logo
    browser.sleep(this.defaultTimeout);
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
    browser.sleep(this.defaultTimeout);
    this.waitForElementToBePresent(this.iconVicRoot);
    this.clickByCSS(this.iconVicRoot);
  }

  navigateToVchTab() {
    // click vch tab
    this.waitForElementToBePresent('.tabbed-object-view');
    this.waitForElementToBePresent(this.tabBtnVchs);
    this.clickByCSS(this.tabBtnVchs);
    browser.wait(() => {
      return browser.getCurrentUrl().then(v => {
        browser.sleep(6000);
        return v.indexOf('customtab-vch') > -1;
      });
    }, this.opsTimeout);
  }

  openVchWizard() {
    this.switchFrame(this.iframeTabs);
    this.waitForElementToBePresent(this.buttonNewVch);
    this.clickByCSS(this.buttonNewVch);
    browser.switchTo().defaultContent();
    this.switchFrame(this.iframeModal);
  }

  selectComputeResource(name: string = 'Cluster') {
    browser.sleep(defaultTimeout);
    this.waitForElementToBePresent(this.datacenterTreenodeCaret);
    element(by.xpath(this.firstDcTreenodeCaretXpath)).isPresent().then(collapsed => {
      if (collapsed) {
        this.clickByXpath(this.firstDcTreenodeCaretXpath);
      }
    });
    this.clickByXpath(`//button[text()[contains(.,'${name}')]]`);
    if (browser.params.hostAffinity === 'true') {
      this.clickByCSS(this.buttonBasicAdvance);
      this.waitForElementToBePresent(this.buttonHostAffinity, 'css');
      this.clickByCSS(this.buttonHostAffinity);
    }
  }

  selectDatastore(name: string = 'datastore1') {
    this.waitForElementToBePresent(this.selectorImageStore);
    this.clickByText(this.selectorImageStore + ' option', name);
  }

  selectBridgeNetwork(name: string = 'bridge') {
    browser.sleep(defaultTimeout);
    this.waitForElementToBePresent(this.selectorBridgeNetwork);
    this.clickByText(this.selectorBridgeNetwork + ' option', name);
  }

  selectPublicNetwork(name: string = 'network') {
    this.waitForElementToBePresent(this.selectorPublicNetwork);
    this.clickByText(this.selectorPublicNetwork + ' option', name);
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
    this.waitForElementToBeGone(this.iframeModal, this.extendedTimeout * 8);
    this.switchFrame(this.iframeTabs);
  }

  deleteVch(vch) {
    this.switchFrame(this.iframeTabs);
    this.waitForElementToBePresent(this.actionBar + vch);
    const vchActionMenu = this.actionBar + vch;
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

  navigateToVchVm(vch) {
    this.switchFrame(this.iframeTabs);
    this.waitForElementToBePresent(this.actionBar + vch);
    this.clickByText('.datagrid-cell a', vch);
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

  clickByXpath(xpath) {
    element(by.xpath(xpath)).isPresent().then(function(result) {
      if (result) {
        browser.driver.findElement(by.xpath(xpath)).click();
      } else {
        console.log(xpath + ' not found');
        return false
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

  waitForElementToBePresent(el, selectBy = 'css', timeout = this.opsTimeout) {
    browser.wait(function () {
      return browser.isElementPresent(by[selectBy](el)).then((v) => {
        if (!v) {
          console.log(el, 'not found yet');
          browser.sleep(100);
          return v;
        }
        return element(by[selectBy](el)).isDisplayed();
      });
    }, timeout);
  };

  waitForElementToBeGone(el, timeout = this.opsTimeout) {
    browser.wait(function () {
      return element(by.css(el)).isPresent().then(function(present) {
        return !present;
      });
    }, timeout);
  };

  waitForTaskDone(targetName, desiredTaskName, timeout = this.opsTimeout) {
    return browser.wait(() => {
      return browser.isElementPresent(by.css(this.latestTask)).then((el) => {
        const taskNameTxt = element(by.css(this.latestTask + ' td:nth-of-type(1)')).getText();
        const taskTargetTxt = element(by.css(this.latestTask + ' td:nth-of-type(2)')).getText();
        const endTimeTxt = element(by.css(this.latestTask + ' td:nth-of-type(7)')).getText();

        browser.sleep(6000);
        return taskNameTxt.then(taskNameValue => {
          return taskTargetTxt.then(targetNameValue => {
            return endTimeTxt.then(endTimeValue => {
              console.log(`${taskNameValue}: ${targetNameValue}: ${endTimeValue}`);
              if (taskNameValue === desiredTaskName && targetNameValue === targetName && endTimeValue) {
                return true;
              }
            });
          });
        });
      }).catch(function(el) {
        console.log(el + ' not found');
        return false;
      });
    }, timeout);
  }
}
