package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyUiVersionStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String CSS_UI_VERSION_SELECTOR =
			"ul.summary-items-list li#version span.summary-value";

	@Override
	public String getDescription() {
		return String.format("%s", "Verifies UI version of VIC UI in the Summary page");
	}

	private void switchToIframe() {
	    WebDriverWait wait = new WebDriverWait(getDriver(), 30);
        By iframe = By.xpath(IFRAME_SELECTOR);
        wait.until(ExpectedConditions.visibilityOfElementLocated(iframe));
        getDriver().switchTo().frame(getDriver().findElement(iframe));
	}

	private void switchToParentFrame() {
		getDriver().switchTo().parentFrame();
	}

	private boolean checkIfVersionShowsCorrectly() throws InterruptedException {
	    By uiVersionElement = By.cssSelector(CSS_UI_VERSION_SELECTOR);
	    int maxTries= 10;
	    int tries = 0;

	    try {
	        for (int i = 0; i < maxTries; i++) {
	            String value = getDriver().findElement(uiVersionElement).getText();
	            tries++;
	            if (!value.isEmpty()) {
	                System.out.println("try " + tries + ": found " + value);
	                return true;
	            }

	            if (tries > 10) {
	                System.out.println("maximum tries reached");
	                return false;
	            }

	            System.out.println("try " + tries + ": string not found yet. retrying...");
	            Thread.sleep(1000);
	        }
	    } catch (InterruptedException e) {
	        return false;
	    }
	    return false;
	}

	@Override
	public void execute() throws Throwable {
		switchToIframe();
		verify.safelyTrue(checkIfVersionShowsCorrectly(), 
					String.format("%s", "Version string should not be empty")
				);
		switchToParentFrame();
	}

}
