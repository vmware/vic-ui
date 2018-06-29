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
    password,
    username,
    extendedTimeout,
    iframeTabs,
    tabSummary,
    menuLabel
  } from './common';

export class VicVchDetails extends VicWebappPage {
    private menuContainer = '#applicationMenuContainer .k-item .k-link';
    private allVicActions;
    private menuLabelNewVch = '';
    private menuLabelDeleteVch = '';

    navigateToVicActionsAllVicActions() {
      browser.switchTo().defaultContent();
      browser.sleep(defaultTimeout);
      this.waitForElementToBePresent(tabSummary);
      this.clickByCSS(tabSummary);
      // wait for menu items to be calculated
      browser.sleep(defaultTimeout);
      this.allVicActions = element(by.cssContainingText(this.menuContainer, 'All VIC Actions'));

      browser.driver.getCapabilities().then(caps => {
        browser.browserName = caps.get('browserName');
        if (browser.browserName.toLowerCase() === 'chrome') {
          browser.actions().mouseMove(this.allVicActions).click().perform();
        } else {
          this.clickByText(this.menuContainer, 'All VIC Actions');
        }
      });
      browser.sleep(defaultTimeout);
     }

     getMenuLabelNewVch() {
        return browser.isElementPresent(by.cssContainingText(menuLabel, 'New Virtual Container Host...'));
     }

     getMenuLabelDeleteVch() {
        return browser.isElementPresent(by.cssContainingText(menuLabel, 'Delete Virtual Container Host'));
     }
    }
