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

import { browser, by, until, element } from 'protractor';
import fs = require('fs');
import path = require('path');

export class VicWebappPage {
  navigateTo() {
    browser.waitForAngularEnabled(false);
    return browser.get('https://localhost:9443');
  }

  login() {
    browser.waitForAngularEnabled(false);
    // username
    browser.driver.findElement(by.css('#username')).click();
    browser.driver.findElement(by.css('#username')).clear();
    browser.driver.findElement(by.css('#username')).sendKeys('administrator@vsphere.local');
    // password
    browser.driver.findElement(by.css('#password')).click();
    browser.driver.findElement(by.css('#password')).clear();
    browser.driver.findElement(by.css('#password')).sendKeys('Admin!23');
    // submit
    browser.driver.findElement(by.css('#submit')).click();
  }

  navigateToHome() {
    // click top left vmware logo
    browser.driver.findElement(by.css('span.clr-vmw-logo')).click();
  }

  navigateToVicPlugin() {
    // click vic shortcut icon
    browser.driver.findElement(by.css('span.com_vmware_vic-home-shortcut-icon')).click();
  }

  navigateToSummaryTab() {
    // click vic link
    browser.driver.findElement(by.css('span.com_vmware_vic-vic-root-icon')).click();
  }

  navigateToVchTab() {
    // click vch tab
    element(by.cssContainingText('a', 'Virtual Container Hosts')).click();
  }

  openVchWizard() {
    browser.switchTo().frame(browser.driver.findElement(by.css('div.outer-tab-content iframe.sandbox-iframe')));
    this.waitForElementToBePresent('button.new-vch');
    browser.driver.findElement(by.css('button.new-vch')).click();
    browser.switchTo().defaultContent();
    browser.switchTo().frame(browser.driver.findElement(by.css('div.modal-body iframe.sandbox-iframe')));
  }

  inputVchName() {
    browser.driver.findElement(by.css('#nameInput')).sendKeys('-77');
  }

  selectComputeResource() {
    this.waitForElementToBePresent('button.cc-resource');
    browser.driver.findElement(by.css('button.cc-resource')).click();
  }

  clickNextButton() {
    element(by.cssContainingText('button', 'Next')).click();
  }

  waitForElementToBePresent(element) {
    browser.wait(function () {
    return browser.isElementPresent(by.css(element));
    }, 60000);
  };

  takeScreenShot(name) {
    browser.takeScreenshot().then(function(png) {
      const file = path.resolve('./' + name + '.png');
      fs.writeFileSync(file, png);
      fs.unlinkSync(file);
    });
  }
}
