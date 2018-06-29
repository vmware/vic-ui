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
import {defaultTimeout} from '../e2e/pages/common';

export class VicWebappPage {

  private h5cActionMenuToggle = 'vc-action-menu.tid-control-bar-user-menu';
  private h5cActionMenuLogOut = 'vc-action-menu-item:nth-of-type(3)';
  private buttonComputeResource = 'button.cc-resource';
  private buttonBasicAdvance = 'a.btn.btn-link.pl-0';
  private buttonHostAffinity = 'label.text-nowrap';
  private iconHostAndClustersShortcut = '.controlcenter-shortcut-icon';
  private latestTask = 'recent-tasks-view tbody tr:nth-of-type(1)';
  private defaultTimeout = 10000;
  private extendedTimeout = 10000;
  private opsTimeout = 80000;

  logOut() {
    this.clickByCSS(this.h5cActionMenuToggle);
    this.waitForElementToBePresent(this.h5cActionMenuLogOut);
    this.clickByCSS(this.h5cActionMenuLogOut);
  }

  waitUntilUrlContains(str: string) {
    browser.wait(() => {
      return browser.getCurrentUrl().then(url => {
        return url.indexOf(str) > -1;
      });
    }, this.opsTimeout);
  }

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
    return browser.wait(function () {
      return browser.isElementPresent(by[selectBy](el)).then((v) => {
        if (!v) {
          console.log(el, 'not found yet');
          browser.sleep(3000);
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
