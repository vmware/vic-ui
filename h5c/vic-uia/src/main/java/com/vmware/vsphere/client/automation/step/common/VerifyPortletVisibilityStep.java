package com.vmware.vsphere.client.automation.step.common;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;

import com.vmware.automation.core.annotation.UsesSpec;
import com.vmware.vsphere.client.automation.spec.PortletSpec;
import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyPortletVisibilityStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private final int WAIT_TIMEOUT = 5;
	private static final String PORTLET_TITLEBAR_TEXT_SELECTOR = "//div[contains(@class, 'vx-portlet')]/div[contains(@class, 'portlet-titlebar')]/span[@title=\"%s\"]";
	private String _labelToNavigate;
	private boolean _isExpectedToExist = true;
	
	@UsesSpec
	private PortletSpec _pSpec;
	
	public VerifyPortletVisibilityStep() {
		super();
	}

	public VerifyPortletVisibilityStep(boolean isExpectedExist) {
		super();
		_isExpectedToExist = isExpectedExist;
	}

	@Override
	public String getDescription() {
		return String.format("Verifies if VCH portlet exists and displays proper information");
	}

	@Override
	public void execute() throws Throwable {
		waitForAngularTestability();
		_labelToNavigate = _pSpec.getTitle();
		verify.fatal(hasPortlet(), _isExpectedToExist,
				"The '" + _labelToNavigate + "' portlet does" +
				(_isExpectedToExist ? "" : " not") + " exist");
	}
	
	private boolean hasPortlet() {
		boolean existing = true;
		String labelToNavigate = String.format(PORTLET_TITLEBAR_TEXT_SELECTOR, _labelToNavigate);

		try {
			element(By.xpath(labelToNavigate)).waitToBeVisible(WAIT_TIMEOUT);
		} catch (TimeoutException e) {
			existing = false;
		}
		
		return existing;
	}

}
