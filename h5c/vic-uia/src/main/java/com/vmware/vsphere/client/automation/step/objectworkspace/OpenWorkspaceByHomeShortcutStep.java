package com.vmware.vsphere.client.automation.step.objectworkspace;

import org.openqa.selenium.By;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class OpenWorkspaceByHomeShortcutStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String XPATH_VIC_ICON_CSS_SELECTOR =
			"//div[contains(text(), \"vSphere Integrated Containers\")]";

	@Override
	public String getDescription() {
		return String.format("%s", "Clicks the 'vSphere Integrated Containers' home shortcut");
	}

	@Override
	public void execute() throws Throwable {
		element(By.xpath(XPATH_VIC_ICON_CSS_SELECTOR)).waitToBeClickable().click();
	}

}
