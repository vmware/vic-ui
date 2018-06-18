'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import { HomePage } from './homePage';
import {
    username,
    password
  } from './common';

export class LoginPage {

private userInput = '#username';
private passwordInput = '#password';
private submitButton = '#submit';
private common: VicWebappPage;

constructor(common) {
    this.common = common;
}

navigateToLoginPage(site) {
    console.log('Navego hasta login page');
    browser.waitForAngularEnabled(false);
    browser.get(site);
}
waitLoginFinish() {
    this.common.waitUntilUrlContains('serverObjectViewsExtension');
  }

submitLogin() {
    browser.waitForAngularEnabled(false);
    this.common.waitForElementToBePresent(this.userInput);
    this.common.clickByCSS(this.userInput);
    this.common.sendKeys(this.userInput, username);
    this.common.waitForElementToBePresent(this.passwordInput);
    this.common.sendKeys(this.passwordInput, password);
    this.common.clickByCSS(this.submitButton);
    this.waitLoginFinish();
    return new HomePage();
}

}
