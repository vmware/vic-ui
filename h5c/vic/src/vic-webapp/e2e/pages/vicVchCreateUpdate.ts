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
    iframeTabs
  } from './common';

export class VchCreateUpdate extends VicWebappPage {

    private inputVchName = '#nameInput';
    private datacenterTreenodeCaret = 'button.clr-treenode-caret';
    private firstDcTreenodeCaretXpath = `(//button[contains(@class,'clr-treenode-caret')])[1]/clr-icon[contains(@dir, 'right')]`;
    private selectorImageStore = 'select#image-store-selector';
    private selectorBridgeNetwork = 'select#bridge-network-selector';
    private selectorPublicNetwork = 'select#public-network-selector';
    private labelEnableSecure = 'label[for=use-client-auth]';
    private inputOpsUser = 'input#ops-user';
    private inputOpsPassword = 'input#ops-password';
    private iframeModal = 'div.modal-body iframe.sandbox-iframe';
    private sectionCompute = 'section#compute-capacity';
    private sectionStorage = 'section#storage-capacity';
    private sectionNetworks = 'section#networks';
    private sectionSecurity = 'section#security';
    private sectionRegistry = 'section#registry';
    private sectionOpsUser = 'section#ops-user';
    private sectionSummary = 'section#summary';

    public getSectionCompute() {
        return this.sectionCompute;
     }

    public getSectionStorage() {
        return this.sectionStorage;
    }

    public getSectionNetwork() {
        return this.sectionNetworks;
    }

    public getSectionSecurity() {
        return this.sectionSecurity;
    }

    public getSectionRegistry() {
        return this.sectionRegistry;
    }

    public getSectionOPsUser() {
        return this.sectionOpsUser;
    }

    public getSectionSummary() {
        return this.sectionSummary;
    }

    processGeneralInfo(specRunId) {
        this.clear(this.inputVchName);
        this.sendKeys(this.inputVchName, namePrefix + specRunId);
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionCompute);
    }

    processComputeResource(name: string = 'Cluster') {
        browser.sleep(defaultTimeout);
        this.waitForElementToBePresent(this.datacenterTreenodeCaret);
        element(by.xpath(this.firstDcTreenodeCaretXpath)).isPresent().then(collapsed => {
            if (collapsed) {
              this.clickByXpath(this.firstDcTreenodeCaretXpath);
            }
          });
          this.clickByXpath(`//button[text()[contains(.,'${name}')]]`);
          this.clickByText('Button', 'Next');
          this.waitForElementToBePresent(this.sectionStorage);
    }

    processStorageResource(name: string = 'datastore1 (1)') {
        this.waitForElementToBePresent(this.selectorImageStore);
        this.clickByText(this.selectorImageStore + ' option', name);
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionNetworks);
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

    processNetworkInfo() {
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionSecurity);
    }

    disableSecureAccess() {
        this.waitForElementToBePresent(this.labelEnableSecure);
        this.clickByCSS(this.labelEnableSecure);
      }

    processSecureAccess() {
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionRegistry);
    }

    processSectionRegistry() {
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionOpsUser);
    }

    processOpsUserCreds() {
        this.clickByCSS(this.inputOpsUser);
        this.sendKeys(this.inputOpsUser, username);
        this.clickByCSS(this.inputOpsPassword);
        this.sendKeys(this.inputOpsPassword, password);
        this.clickByText('Button', 'Next');
        this.waitForElementToBePresent(this.sectionSummary);
    }

    createVch() {
        this.clickByText('Button', 'Finish');
        browser.switchTo().defaultContent();
        this.waitForElementToBeGone(this.iframeModal, extendedTimeout * 8);
        this.switchFrame(iframeTabs);
    }
}
