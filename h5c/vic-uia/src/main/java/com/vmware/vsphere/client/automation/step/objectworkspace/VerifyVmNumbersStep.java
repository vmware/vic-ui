package com.vmware.vsphere.client.automation.step.objectworkspace;

import com.vmware.vsphere.client.automation.core.wrapper.By;
import com.vmware.vsphere.client.automation.core.wrapper.ElementState;
import com.vmware.vsphere.client.automation.core.wrapper.IElement;
import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyVmNumbersStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String XPATH_DATAGRID_VCH_LEN_SELECTOR =
			"//div[@vx-extension-view-id=\"com.vmware.vic.objectView.list\"]" +
			"//div[contains(@class, \"k-grid-content\")][1]" +
			"//td[@role=\"gridcell\"][2]";
	private static final String XPATH_DATAGRID_CONTAINER_LEN_SELECTOR =
			"//div[@vx-extension-view-id=\"com.vmware.vic.objectView.list\"]" +
			"//div[contains(@class, \"k-grid-content\")][1]" +
			"//td[@role=\"gridcell\"][3]";

	@Override
	public String getDescription() {
		return String.format("%s", "Verifies if Datagrid shows correctly that there are one VCH and one Container");
	}

	@Override
	public void execute() throws Throwable {
	    IElement elementVchLen = UI().element(By.xpath(XPATH_DATAGRID_VCH_LEN_SELECTOR));
	    elementVchLen.waitToBe(ElementState.visible);
		verify.safely(
				elementVchLen.getText(),
				"1",
				String.format("%s", "# of VCHs should strictly be 1. If multiple VCHs show up,"
						+ "remove manually installed VCHs"));
		
		IElement elementContainersLen = UI().element(By.xpath(XPATH_DATAGRID_CONTAINER_LEN_SELECTOR));
		elementContainersLen.waitToBe(ElementState.visible);
		verify.fatal(
				elementContainersLen.getText(),
				"1",
				String.format("%s", "# of Containers should strictly be 1. "
						+ "If multiple VCHs show up, remove manually installed Containers"));
	}

}
