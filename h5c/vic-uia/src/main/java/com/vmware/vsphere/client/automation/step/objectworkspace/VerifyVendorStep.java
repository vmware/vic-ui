package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyVendorStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String CSS_VENDOR_SELECTOR =
			"ul.summary-items-list li#vendor span.summary-value";

	@Override
	public String getDescription() {
		return String.format("%s", "Verifies if vendor is set properly");
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
	
	@Override
	public void execute() throws Throwable {
		switchToIframe();
		verify.safely(
		        getDriver().findElement(By.cssSelector(CSS_VENDOR_SELECTOR))
					.getText(),
				"VMware",
				String.format("%s", "Vendor should be 'VMware'"));
		switchToParentFrame();
	}
}
