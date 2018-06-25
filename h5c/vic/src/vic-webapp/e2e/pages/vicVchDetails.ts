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
