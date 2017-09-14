package com.vmware.vsphere.client.automation.step.vch;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;

public class VchPortletHasProperLocaleStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String VCH_PORTLET_TITLE_SELECTOR_FORMAT = "//span[contains(@title, \"%s\")]";
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String DOCKER_API_ENDPOINT_TH_SELECTOR = "//vic-vch-portlet/table/tbody/tr[1]/th";
	private static final String VCH_ADMIN_PORTAL_TH_SELECTOR = "//vic-vch-portlet/table/tbody/tr[2]/th";
	private static final String LOCALE_PATH = "locale/%s/com_vmware_vic.properties";
	private static String BROWSER_LOCALE;

	private Properties _props = new Properties();

	private void getLocale() throws IOException {
		final JavascriptExecutor jsExecutor = ((JavascriptExecutor) getDriver());
		BROWSER_LOCALE = (String) jsExecutor.executeScript("return WEB_PLATFORM.getLocale()");
		// in case locale is not defined in browser URL default it to en_US
		if (BROWSER_LOCALE == null) {
			BROWSER_LOCALE = "en_US";
		}
		System.out.println("Browser locale is: " + BROWSER_LOCALE);
		ClassLoader loader = Thread.currentThread().getContextClassLoader();
		try (InputStream resourceStream = loader.getResourceAsStream(
		        String.format(LOCALE_PATH, BROWSER_LOCALE))) {
		    _props.load(resourceStream);
		}
	}

	private String getLocalizedValue(String key) throws IOException {
		if (_props == null) {

		}
		return _props.getProperty(key);
	}

	private void switchToIframe() {
	    WebDriverWait wait = new WebDriverWait(getDriver(), 30);
        By iframe = By.xpath(IFRAME_SELECTOR);
        wait.until(ExpectedConditions.visibilityOfElementLocated(iframe));
        getDriver().switchTo().frame(getDriver().findElement(iframe));
	}

	@Override
	public String getDescription() {
		return String.format("Verifies if VCH portlet shows information in correct locale");
	}

	@Override
	public void execute() throws Throwable {
		getLocale();
		final String localizedVchPortletTitle = getLocalizedValue("vch.label");
		final String localizedDockerApiEndpointLabel = getLocalizedValue("vch.dockerApiEndpoint.label");
		final String localizedVchAdminPortalLabel = getLocalizedValue("vch.vchAdminPortal.label");
		final String vchPortletTitleSelector = String.format(VCH_PORTLET_TITLE_SELECTOR_FORMAT, localizedVchPortletTitle);
		verify.fatal(getDriver().findElement(By.xpath(vchPortletTitleSelector)).getText(),
				localizedVchPortletTitle,
				String.format("VCH portlet label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedVchPortletTitle));
		switchToIframe();
		verify.fatal(getDriver().findElement(By.xpath(DOCKER_API_ENDPOINT_TH_SELECTOR)).getText(),
				localizedDockerApiEndpointLabel,
				String.format("Docker API endpoint label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedDockerApiEndpointLabel));
		verify.fatal(getDriver().findElement(By.xpath(VCH_ADMIN_PORTAL_TH_SELECTOR)).getText(),
				localizedVchAdminPortalLabel,
				String.format("VCH Admin portal label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedVchAdminPortalLabel));
	}

}
