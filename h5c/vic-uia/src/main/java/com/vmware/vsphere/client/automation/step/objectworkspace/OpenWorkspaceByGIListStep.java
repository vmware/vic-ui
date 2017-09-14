package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class OpenWorkspaceByGIListStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String XPATH_GI_VIC_SELECTOR =
			"//span[contains(@title, \"vSphere Integrated Containers\")]";

	@Override
	public String getDescription() {
		return String.format("%s", "Clicks the 'vSphere Integrated Containers' in the Global Invetory List");
	}

	@Override
	public void execute() throws Throwable {
		element(By.xpath(XPATH_GI_VIC_SELECTOR)).waitToBeClickable().click();
	}

}
