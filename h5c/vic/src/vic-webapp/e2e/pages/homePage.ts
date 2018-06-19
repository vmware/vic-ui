'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import { defaultTimeout } from './common';
import { VicVchMain } from './vicVchMain';

export class HomePage extends VicWebappPage {

private iconVsphereHome = '.clr-vmw-logo';
private iconVicShortcut = '.com_vmware_vic-home-shortcut-icon';

navigateToHome() {
    browser.sleep(defaultTimeout);
    this.waitForElementToBePresent(this.iconVsphereHome);
    this.clickByCSS(this.iconVsphereHome);
}

navigateToVicPLugin() {
    this.waitForElementToBePresent(this.iconVicShortcut);
    this.clickByCSS(this.iconVicShortcut);
    return new VicVchMain();
}

}
