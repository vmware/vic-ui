package com.vmware.vsphere.client.automation.step.vch;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.automation.core.annotation.UsesSpec;
import com.vmware.vim.binding.vim.VirtualMachine.PowerState;
import com.vmware.vsphere.client.automation.core.spec.SingleValueSpec;
import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VerifyVchPortletContentStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String ATTRIBUTE_PLACEHOLDER_VAL = "-";
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String DOCKER_API_ENDPOINT_TD_SELECTOR = "//vic-vch-portlet/table/tbody/tr[1]/td";
	private static final String VCH_ADMIN_PORTAL_TD_SELECTOR = "//vic-vch-portlet/table/tbody/tr[2]/td";
	private final String REFRESH_BUTTON_CSS_SELECTOR = "span[class~='vui-icon-refresh']";

	private static String dockerApiEndpointActualVal;
	private static String vchAdminPortalActualVal;

	@UsesSpec
	private SingleValueSpec<PowerState> powerStateSpec;

	@Override
	public String getDescription() {
		return String.format("Verifies the VCH portlet content when VM is: %s", powerStateSpec.getValue());
	}

	@Override
	public void execute() throws Throwable {
		verify.fatal(tdsExist(), Boolean.TRUE, "The VCH portlet should have table rows each for Docker API endpoint and VCH Admin Portal");
		verify.fatal(waitIfVchIsInExpectedState(), Boolean.TRUE, String.format("Wait until VCH VM is ready after \"%s\" operation", powerStateSpec.getValue()));
		verify.fatal(dockerApiEndpointActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL),
	    		    (powerStateSpec.getValue() == PowerState.poweredOff ? Boolean.TRUE : Boolean.FALSE),
                    "Docker API Endpoint value should " +
                    (powerStateSpec.getValue() == PowerState.poweredOff ? "be " : "not be ") +
                    ATTRIBUTE_PLACEHOLDER_VAL + ". Actual value is: " + dockerApiEndpointActualVal);
		verify.fatal(vchAdminPortalActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL),
    		    (powerStateSpec.getValue() == PowerState.poweredOff ? Boolean.TRUE : Boolean.FALSE),
                "VCH Admin Portal value should " +
                (powerStateSpec.getValue() == PowerState.poweredOff ? "be " : "not be ") +
                ATTRIBUTE_PLACEHOLDER_VAL + ". Actual value is: " + vchAdminPortalActualVal);
	}

	private boolean waitIfVchIsInExpectedState() throws InterruptedException {
		boolean vchInExpectedState = false;
		int retryMax = 30;
		int tried = 0;
		try {
			while(!vchInExpectedState) {
				retrieveVchInformation();

				if (powerStateSpec.getValue() == PowerState.poweredOn) {
					vchInExpectedState = !(dockerApiEndpointActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL)) && !(vchAdminPortalActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL));
				} else {
					vchInExpectedState = dockerApiEndpointActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL) && vchAdminPortalActualVal.equals(ATTRIBUTE_PLACEHOLDER_VAL);
				}

				if (vchInExpectedState) {
					break;
				} else {
					switchToParentFrame();
					refreshUi();
					switchToIframe();
					tried++;
					if (tried > retryMax) {
						throw new TimeoutException("Retry max reached while refreshing the Summary view");
					}
					Thread.sleep(2000);
				}
			}
		} catch (TimeoutException e) {
			vchInExpectedState = false;
		} catch (InterruptedException e) {
		    vchInExpectedState = false;
		}
		return vchInExpectedState;
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

	private void retrieveVchInformation() {
		dockerApiEndpointActualVal = getDriver().findElement(By.xpath(DOCKER_API_ENDPOINT_TD_SELECTOR)).getText();
		vchAdminPortalActualVal = getDriver().findElement(By.xpath(VCH_ADMIN_PORTAL_TD_SELECTOR)).getText();
	}

	private void refreshUi() {
	    WebDriverWait wait = new WebDriverWait(getDriver(), 30);
        By vuiRefresh = By.cssSelector(REFRESH_BUTTON_CSS_SELECTOR);
        wait.until(ExpectedConditions.visibilityOfElementLocated(vuiRefresh));
	    getDriver().findElement(vuiRefresh).click();
	}

	private boolean tdsExist() {
		boolean tdsFound = true;
		try {
			waitForAngularTestability();
			switchToIframe();
			retrieveVchInformation();
		} catch (TimeoutException e) {
			tdsFound = false;
		}
		return tdsFound;
	}

}
