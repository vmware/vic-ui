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

import {browser, by, element, protractor} from 'protractor';

import { PROTRACTOR_JASMINE_TIMEOUT } from '../../src/app/testing/jasmine.constants';
import { VicWebappPage } from '../app.po';
import { LoginPage } from '../pages/login';
import { HomePage } from '../pages/homePage';
import { VicVchMain, VchCreateGeneralComponent } from '../pages/vicVchMain';
import {
  modalWizard,
} from '../pages/common';


describe('VCH Create Wizard - Basic', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = PROTRACTOR_JASMINE_TIMEOUT;
  let page: VicWebappPage;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let vicMain: VicVchMain;
  let vicVchCreate: VchCreateGeneralComponent;
  let specRunId: number;
  specRunId = Math.floor(Math.random() * 1000) + 100;

  beforeAll(() => {
    specRunId = Math.floor(Math.random() * 1000) + 100;
  });

  beforeEach(() => {
    page = new VicWebappPage();
  });

  afterAll(() => {
    page.logOut();
  });

  it('should redirect to login', () => {
    loginPage = new LoginPage(page);
    browser.driver.manage().window().maximize();
    loginPage.navigateToLoginPage('https://localhost:9443');
    expect(browser.getCurrentUrl()).toContain('SSO');
  });

  it('should login', () => {
    homePage = loginPage.submitLogin();
    expect(browser.getCurrentUrl()).toContain('/ui');
  });

  it('should navigate to vsphere home', () => {
    homePage.navigateToHome();
    expect(browser.getCurrentUrl()).toContain('vsphere');
  });

  it('should navigate to vic plugin', () => {
    vicMain = homePage.navigateToVicPLugin();
    expect(browser.getCurrentUrl()).toContain('vic');
  });

  it('should navigate to summary tab', () => {
    vicMain.navigateToSummaryTab();
  });

  it('should navigate to vch tab', () => {
    vicMain.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should open create vch wizard', () => {
    vicVchCreate = vicMain.navigateToVchWizard();
    expect(element(by.css(modalWizard)).isPresent()).toBe(true);
  });

  it('should input vch name', () => {
    vicVchCreate.processGeneralInfo(specRunId);
    expect(element(by.css(vicVchCreate.getSectionCompute())).isPresent()).toBe(true);
  });

  it('should select a compute resource', () => {
    vicVchCreate.processComputeResource();
    expect(element(by.css(vicVchCreate.getSectionStorage())).isPresent()).toBe(true);
  });

  it('should select a datastore', () => {
    vicVchCreate.processStorageResource();
    expect(element(by.css(vicVchCreate.getSectionNetwork())).isPresent()).toBe(true);
  });

  it('should select a bridge network', () => {
    vicVchCreate.selectBridgeNetwork();
  });

  it('should select a public network', () => {
    vicVchCreate.selectPublicNetwork();
  });

  it('should complete networks step', () => {
   vicVchCreate.processNetworkInfo();
    expect(element(by.css(vicVchCreate.getSectionSecurity())).isPresent()).toBe(true);
  });

  it('should complete security step', () => {
    vicVchCreate.disableSecureAccess()
    vicVchCreate.processSecureAccess();
    expect(element(by.css(vicVchCreate.getSectionRegistry())).isPresent()).toBe(true);
  });

  it('should complete registry access step', () => {
    vicVchCreate.processSectionRegistry();
    expect(element(by.css(vicVchCreate.getSectionOPsUser())).isPresent()).toBe(true);
  });

  it('should enter ops user creds', () => {
    vicVchCreate.processOpsUserCreds();
    expect(element(by.css(vicVchCreate.getSectionSummary())).isPresent()).toBe(true);
  });

  it('should create a vch', () => {
    vicVchCreate.createVch();
  });
/*
  it('should find the new vch in datagrid', () => {
    let vchFound = false;
    page.waitForElementToBePresent(dataGridCell);
    page.clickByCSS('.pagination-next');
    page.waitForElementToBePresent(dataGridCell);
    browser.sleep(defaultTimeout);
    const newVch = new RegExp(namePrefix + specRunId);
    element.all(by.css(dataGridCell)).each(function(el, index) {
      el.isPresent().then(present => {
        if (present) {
          el.getText().then(function(text) {
            if (newVch.test(text)) {
              vchFound = true;
            }
          });
        }
      })
    }).then(function() {
      expect(vchFound).toBeTruthy();
    });
  });

  it('should verify the new vch has properly started', () => {
    browser.switchTo().defaultContent();
    page.waitForTaskDone(namePrefix + specRunId, 'Reconfigure virtual machine').then((status) => {
      expect(status).toBeTruthy();
    });
  });

  if (browser.params.hostAffinity === 'true') {
    it('should redirect to VCH VM and select Cluster from VCH related objects', () => {
      page.navigateToVchVm(namePrefix + specRunId);
      browser.switchTo().defaultContent();
      browser.sleep(defaultTimeout);
      const vch = new RegExp(namePrefix + specRunId);
      page.waitForElementToBePresent('a[title=Cluster]');
      page.clickByCSS('a[title=Cluster]');
      });

    it('should navigate to clusters actions and settings', () => {
      browser.switchTo().defaultContent();
      browser.sleep(defaultTimeout);
      page.waitForElementToBePresent(tabSummary);
      page.clickByCSS(tabSummary);
      browser.sleep(defaultTimeout);
      const clustersActions = element(by.cssContainingText(menuContainer, 'Settings'));
      browser.driver.getCapabilities().then(caps => {
        browser.browserName = caps.get('browserName');
        if (browser.browserName.toLowerCase() === 'chrome') {
          browser.actions().mouseMove(clustersActions).click().perform();
        } else {
          page.clickByText(menuContainer, 'Settings');
        }
      });
    });

    it('should validate the additions of the vch to the host/virtual machines group', () => {
      page.waitForElementToBePresent('//div[2]/ul/li[3]/a', 'xpath');
      page.clickByXpath('//div[2]/ul/li[3]/a');
      const vch = new RegExp(namePrefix + specRunId);
      browser.switchTo().defaultContent();
      expect(element(by.css('span[title=' + vch + ']')).isPresent).toBeTruthy();
    });
  } else {
    it('should redirect to VCH VM and display Create Wizard menu items', () => {
      page.navigateToVchVm(namePrefix + specRunId);
      browser.switchTo().defaultContent();
      browser.sleep(defaultTimeout);
      page.waitForElementToBePresent(tabSummary);
      page.clickByCSS(tabSummary);
      // wait for menu items to be calculated
      browser.sleep(defaultTimeout);
      const allVicActions = element(by.cssContainingText(menuContainer, 'All VIC Actions'));

      browser.driver.getCapabilities().then(caps => {
        browser.browserName = caps.get('browserName');
        if (browser.browserName.toLowerCase() === 'chrome') {
          browser.actions().mouseMove(allVicActions).click().perform();
        } else {
          page.clickByText(menuContainer, 'All VIC Actions');
        }
      });
      browser.sleep(defaultTimeout);
      expect(browser.isElementPresent(by.cssContainingText(menuLabel, 'New Virtual Container Host...'))).toBeTruthy();
      expect(browser.isElementPresent(by.cssContainingText(menuLabel, 'Delete Virtual Container Host'))).toBeTruthy();
    });
 }

  it('should navigate to vch list', () => {
    page.navigateToHome();
    page.waitUntilUrlContains('controlcenter');
    page.navigateToVicPlugin();
    page.waitUntilUrlContains('vic.objectView_collection');
    page.navigateToSummaryTab();
    page.waitUntilUrlContains('vic.customtab-vch');
    page.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should delete created vch', () => {
    page.deleteVch(namePrefix + specRunId);
  });

  it('should verify the created vch has been deleted', () => {
    let vchFound = false;
    page.switchFrame(iframeTabs);
    const vchClrDgActionXpath = `//clr-dg-action-overflow[contains(@class, '${namePrefix + specRunId}')]`;
    element(by.xpath(vchClrDgActionXpath)).isPresent().then(present => {
      vchFound = present;
    });

    browser.sleep(defaultTimeout);
    browser.switchTo().defaultContent();
    page.waitForTaskDone(namePrefix + specRunId, 'Delete resource pool');
    expect(vchFound).toBeFalsy();
  });
  */
});
