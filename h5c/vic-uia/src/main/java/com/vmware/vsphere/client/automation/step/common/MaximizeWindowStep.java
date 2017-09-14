package com.vmware.vsphere.client.automation.step.common;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

import java.awt.Toolkit;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;

public class MaximizeWindowStep extends UiTestStep {
	private static final int TARGET_WINDOW_WIDTH = 1280;
	private static final int TARGET_WINDOW_HEIGHT = 900;

	@Override
	public String getDescription() {
		return String.format("%s", "Sets the browser window to a certain size");
	}

	@Override
	public void execute() throws Throwable {
		Dimension screenSize = new Dimension(
				TARGET_WINDOW_WIDTH, TARGET_WINDOW_HEIGHT);
		getDriver().manage().window().setSize(screenSize);
		getDriver().manage().window().maximize();
	}

}
