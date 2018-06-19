'use strict';
import { browser, by, element, ElementFinder } from 'protractor';
import { VicWebappPage } from '../app.po';
import { HomePage } from './homePage';
import {
    username,
    password
  } from './common';

export class LoginPage extends VicWebappPage {

private userInput = '#username';
private passwordInput = '#password';
private submitButton = '#submit';

navigateToLoginPage(site) {
    console.log('Navego hasta login page');
    browser.waitForAngularEnabled(false);
    browser.get(site);
}
waitLoginFinish() {
    this.waitUntilUrlContains('serverObjectViewsExtension');
  }

submitLogin() {
    browser.waitForAngularEnabled(false);
    this.waitForElementToBePresent(this.userInput);
    this.clickByCSS(this.userInput);
    this.sendKeys(this.userInput, username);
    this.waitForElementToBePresent(this.passwordInput);
    this.sendKeys(this.passwordInput, password);
    this.clickByCSS(this.submitButton);
    this.waitLoginFinish();
    return new HomePage();
}

}
