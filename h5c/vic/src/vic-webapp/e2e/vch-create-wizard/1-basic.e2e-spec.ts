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
import { LoginPage } from '../pages/loginPage';
import { HomePage } from '../pages/homePage';
import { VicVchMain} from '../pages/vicVchMain';
import {
  modalWizard,
  menuLabel
} from '../pages/common';
import { VchCreateUpdate } from '../pages/vicVchCreateUpdateView';
import { VicVchDetails } from '../pages/vicVchDetails';


describe('VCH Create Wizard - Basic', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = PROTRACTOR_JASMINE_TIMEOUT;
  let utility: VicWebappPage;
  let loginPage: LoginPage;
  let homePage: HomePage;
  let vicMain: VicVchMain;
  let vicVchCreate: VchCreateUpdate;
  let vicVchDetails: VicVchDetails;
  let specRunId: number;
  specRunId = Math.floor(Math.random() * 1000) + 100;

  beforeAll(() => {
    specRunId = Math.floor(Math.random() * 1000) + 100;
    utility = new VicWebappPage();
  });

  beforeEach(() => {
  });

  afterAll(() => {
    utility.logOut();
  });

  it('should redirect to login', () => {
    loginPage = new LoginPage();
    browser.driver.manage().window().setPosition(0, 0);
    browser.driver.manage().window().setSize(1366, 880);
    loginPage.navigateToLoginPage();
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
    vicMain = homePage.navigateToVicPlugin();
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
    vicVchCreate = vicMain.navigateToCreateWizard();
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
  });

  it('should create a vch', () => {
    vicVchCreate.createVch();
  });

  it('should find the new vch in datagrid', () => {
    expect(vicMain.checkVchOnDataGrid(specRunId)).toBeTruthy();
  });

  it('should verify the new vch has properly started', () => {
    expect(vicMain.checkVchStarted(specRunId)).toBeTruthy();
  });

  it('should redirect to VCH VM and display Create Wizard menu items', () => {

    vicVchDetails = vicMain.navigateToVchVmDetails(specRunId);
    vicVchDetails.navigateToVicActionsAllVicActions();
    expect(vicVchDetails.getMenuLabelNewVch).toBeTruthy();
    expect(vicVchDetails.getMenuLabelDeleteVch).toBeTruthy();
  });

  it('should navigate to vch list', () => {
    homePage.navigateToHome();
    homePage.navigateToVicPlugin();
    vicMain.waitUntilUrlContains('vic.objectView_collection');
    vicMain.navigateToSummaryTab();
    vicMain.waitUntilUrlContains('vic.customtab-vch');
    vicMain.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should delete created vch', () => {
    vicMain.deleteVch(specRunId);
  });


  it('should verify the created vch has been deleted', () => {
    expect(vicMain.checkVchDeleted(specRunId)).toBeFalsy();
  });

});
