package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class OpenVicWorkspaceLandingPageStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String XPATH_DATAGRID_VIC_SELECTOR =
			"//div[@vx-extension-view-id=\"com.vmware.vic.objectView.list\"]" +
			"//div[contains(@class, \"k-grid-content\")][1]" +
			"//td[@role=\"gridcell\"][1]//a";

	@Override
	public String getDescription() {
		return String.format("%s", "Clicks 'vSphere Integrated Containers' in the data grid to naviagate to the landing page");
	}

	@Override
	public void execute() throws Throwable {
		element(By.xpath(XPATH_DATAGRID_VIC_SELECTOR))
			.waitToBeClickable().click();
	}

}
