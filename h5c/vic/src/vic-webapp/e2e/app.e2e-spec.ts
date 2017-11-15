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

import { VicWebappPage } from './app.po';
import { browser, by, until, element } from 'protractor';
import fs = require('fs');
import path = require('path');

describe('vic-webapp create vch', () => {
  let page: VicWebappPage;
  const timeout = 15000;

  beforeEach(() => {
    page = new VicWebappPage();
  });

  it('should redirect to login', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).toContain('SSO');
  });

  it('should login', () => {
    page.login();
    page.takeScreenShot('wait_on_login');
    browser.waitForAngularEnabled(true);
    expect(browser.getCurrentUrl()).toContain('/ui');
  });

  it('should navigate to vsphere home', () => {
    page.navigateToHome();
    expect(browser.getCurrentUrl()).toContain('vsphere');
  });

  it('should navigate to vic plugin', () => {
    page.navigateToVicPlugin();
    expect(browser.getCurrentUrl()).toContain('vic');
  });

  it('should navigate to summary tab', () => {
    page.navigateToSummaryTab();
    expect(browser.getCurrentUrl()).toContain('vic-root');
  });

  it('should navigate to vch tab', () => {
    page.navigateToVchTab();
    expect(browser.getCurrentUrl()).toContain('customtab-vch');
  });

  it('should open create vch wizard', () => {
    page.openVchWizard();
    expect(element(by.css('.clr-wizard-stepnav')).isPresent()).toBe(true);
  });

  it('should input vch name', () => {
    page.inputVchName();
  });

  it('should complete general step', () => {
    page.clickNextButton();
    // check if we made it to compute capacity section
    expect(element(by.css('section#compute-capacity')).isPresent()).toBe(true);
  });

  it('should select a compute resource', () => {
    page.selectComputeResource();
  });

  it('should complete compute resource step', () => {
    page.clickNextButton();
    // check if we made it to storage capacity section
    expect(element(by.css('section#storage-capacity')).isPresent()).toBe(true);
  });

});
