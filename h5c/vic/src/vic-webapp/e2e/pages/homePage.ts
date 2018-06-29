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

navigateToVicPlugin() {
    this.waitForElementToBePresent(this.iconVicShortcut);
    this.clickByCSS(this.iconVicShortcut);
    return new VicVchMain();
}

}
