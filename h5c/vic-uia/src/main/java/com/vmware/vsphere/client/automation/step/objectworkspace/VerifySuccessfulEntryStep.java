package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifySuccessfulEntryStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String XPATH_VIC_HEADER_SELECTOR =
			"//div/span[text()=\"vSphere Integrated Containers\"]";

	@Override
	public String getDescription() {
		return String.format("%s", "Verifies if the landing page of VIC Workspace is shown");
	}

	@Override
	public void execute() throws Throwable {
		verify.fatalTrue(hasVicHeaderText(),
				String.format("Header should exist for VIC"));
	}
	
	private boolean hasVicHeaderText() {
		boolean result = true;
		try {
			element(By.xpath(XPATH_VIC_HEADER_SELECTOR)).waitToBeVisible();
		} catch (TimeoutException e) {
			return false;
		}
		return result;
	}
}
