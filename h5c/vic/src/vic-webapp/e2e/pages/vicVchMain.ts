'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import {
    defaultTimeout,
    opsTimeout,
    modalWizard,
    namePrefix,
    extendedTimeout,
    iframeTabs
  } from './common';
import { VchCreateUpdate } from './vicVchCreateUpdateView';

export class VicVchMain extends VicWebappPage {

    private iconVicRoot = 'span[title="vSphere Integrated Containers"]:last-of-type';
    private objectTab = '.tabbed-object-view';
    private buttonVchsTab = 'li.tid-com-vmware-vic-customtab-vch-navi-tab-header a';
    private iframeTabs = 'div.outer-tab-content iframe.sandbox-iframe';
    private buttonNewVch = 'button.new-vch';
    private iframeModal = 'div.modal-body iframe.sandbox-iframe';

    navigateToSummaryTab() {
         browser.sleep(defaultTimeout);
         this.waitForElementToBePresent(this.iconVicRoot);
         this.clickByCSS(this.iconVicRoot);
    }

    navigateToVchTab() {
        this.waitForElementToBePresent(this.objectTab);
        this.waitForElementToBePresent(this.buttonVchsTab);
        this.clickByCSS(this.buttonVchsTab);
        browser.wait(() => {
          return browser.getCurrentUrl().then(v => {
            browser.sleep(6000);
            return v.indexOf('customtab-vch') > -1;
          });
        }, opsTimeout);
    }

    navigateToCreateWizard() {
        this.switchFrame(this.iframeTabs);
        this.waitForElementToBePresent(this.buttonNewVch)
        this.clickByCSS(this.buttonNewVch);
        browser.switchTo().defaultContent();
        this.switchFrame(this.iframeModal);
        this.waitForElementToBePresent(modalWizard);
        return new VchCreateUpdate();
    }
    }
