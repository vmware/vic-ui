'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import { defaultTimeout } from './common';
import { VicVchMain } from './vicVchMain';

export class HomePage {

private common: VicWebappPage;
private iconVsphereHome = '.clr-vmw-logo';
private iconVicShortcut = '.com_vmware_vic-home-shortcut-icon';

constructor() {
    this.common = new VicWebappPage();
}

navigateToHome() {
    browser.sleep(defaultTimeout);
    this.common.waitForElementToBePresent(this.iconVsphereHome);
    this.common.clickByCSS(this.iconVsphereHome);
}

navigateToVicPLugin() {
    this.common.waitForElementToBePresent(this.iconVicShortcut);
    this.common.clickByCSS(this.iconVicShortcut);
    return new VicVchMain();
}

}
