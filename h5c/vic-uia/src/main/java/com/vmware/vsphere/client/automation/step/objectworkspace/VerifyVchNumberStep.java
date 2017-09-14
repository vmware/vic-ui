package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyVchNumberStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final long ELEMENT_TIMEOUT = 30;
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String CSS_VCH_LEN_SELECTOR =
			"ul.summary-items-list li#vch_len span.summary-value";

	@Override
	public String getDescription() {
		return String.format("%s", "Verifies # of Virtual Container Hosts in the Summary page");
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
		        getDriver().findElement(By.cssSelector(CSS_VCH_LEN_SELECTOR))
					.getText(),
				"1",
				String.format("%s", "VCH length should be 1"));
		switchToParentFrame();
	}

}
