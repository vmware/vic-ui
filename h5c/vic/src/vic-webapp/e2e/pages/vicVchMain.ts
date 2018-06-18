'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import {
    defaultTimeout,
    opsTimeout,
    modalWizard,
    namePrefix,
    sectionCompute,
    sectionStorage,
    sectionNetworks,
    sectionRegistry,
    sectionOpsUser,
    password,
    username,
    extendedTimeout,
    iframeTabs
  } from './common';

export class VchCreateGeneralComponent {

    private common: VicWebappPage;
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

    constructor() {
        this.common = new VicWebappPage();
    }

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
        this.common.clear(this.inputVchName);
        this.common.sendKeys(this.inputVchName, namePrefix + specRunId);
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(sectionCompute);
    }

    processComputeResource(name: string = 'Cluster') {
        browser.sleep(defaultTimeout);
        this.common.waitForElementToBePresent(this.datacenterTreenodeCaret);
        element(by.xpath(this.firstDcTreenodeCaretXpath)).isPresent().then(collapsed => {
            if (collapsed) {
              this.common.clickByXpath(this.firstDcTreenodeCaretXpath);
            }
          });
          this.common.clickByXpath(`//button[text()[contains(.,'${name}')]]`);
          this.common.clickByText('Button', 'Next');
          this.common.waitForElementToBePresent(sectionStorage);
    }

    processStorageResource(name: string = 'datastore1 (1)') {
        this.common.waitForElementToBePresent(this.selectorImageStore);
        this.common.clickByText(this.selectorImageStore + ' option', name);
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(sectionNetworks);
    }

    selectBridgeNetwork(name: string = 'bridge') {
        browser.sleep(defaultTimeout);
        this.common.waitForElementToBePresent(this.selectorBridgeNetwork);
        this.common.clickByText(this.selectorBridgeNetwork + ' option', name);
      }

    selectPublicNetwork(name: string = 'network') {
    this.common.waitForElementToBePresent(this.selectorPublicNetwork);
    this.common.clickByText(this.selectorPublicNetwork + ' option', name);
    }

    processNetworkInfo() {
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(this.sectionSecurity);
    }

    disableSecureAccess() {
        this.common.waitForElementToBePresent(this.labelEnableSecure);
        this.common.clickByCSS(this.labelEnableSecure);
      }

    processSecureAccess() {
        this.common.waitForElementToBePresent(this.labelEnableSecure);
        this.common.clickByCSS(this.labelEnableSecure);
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(sectionRegistry);
    }

    processSectionRegistry() {
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(sectionOpsUser);
    }

    processOpsUserCreds() {
        this.common.clickByCSS(this.inputOpsUser);
        this.common.sendKeys(this.inputOpsUser, username);
        this.common.clickByCSS(this.inputOpsPassword);
        this.common.sendKeys(this.inputOpsPassword, password);
        this.common.clickByText('Button', 'Next');
        this.common.waitForElementToBePresent(sectionOpsUser);
    }

    createVch() {
        this.common.clickByText('Button', 'Finish');
        browser.switchTo().defaultContent();
        this.common.waitForElementToBeGone(this.iframeModal, extendedTimeout * 8);
        this.common.switchFrame(iframeTabs);
    }
}
// TODO: Sacar esto a un archivo diferente
// TODO: Crear un archivo para sacar las cosas comunes a VIC
export class VicVchMain {

    private common: VicWebappPage;
    private iconVicRoot = 'span[title="vSphere Integrated Containers"]:last-of-type';
    private objectTab = '.tabbed-object-view';
    private buttonVchsTab = 'li.tid-com-vmware-vic-customtab-vch-navi-tab-header a';
    private iframeTabs = 'div.outer-tab-content iframe.sandbox-iframe';
    private buttonNewVch = 'button.new-vch';
    private iframeModal = 'div.modal-body iframe.sandbox-iframe';

    constructor() {
        this.common = new VicWebappPage();
    }

    navigateToSummaryTab() {
         browser.sleep(defaultTimeout);
         this.common.waitForElementToBePresent(this.iconVicRoot);
         this.common.clickByCSS(this.iconVicRoot);
    }

    navigateToVchTab() {
        this.common.waitForElementToBePresent(this.objectTab);
        this.common.waitForElementToBePresent(this.buttonVchsTab);
        this.common.clickByCSS(this.buttonVchsTab);
        browser.wait(() => {
          return browser.getCurrentUrl().then(v => {
            browser.sleep(6000);
            return v.indexOf('customtab-vch') > -1;
          });
        }, opsTimeout);
    }

    navigateToVchWizard() {
        this.common.switchFrame(this.iframeTabs);
        this.common.waitForElementToBePresent(this.buttonNewVch)
        this.common.clickByCSS(this.buttonNewVch);
        browser.switchTo().defaultContent();
        this.common.switchFrame(this.iframeModal);
        this.common.waitForElementToBePresent(modalWizard);
        return new VchCreateGeneralComponent();
    }
    }
