package com.vmware.vsphere.client.automation.step.container;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import com.vmware.vsphere.client.automation.core.annotation.View;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.vmware.vsphere.client.automation.step.ui.UiTestStep;
import com.vmware.vsphere.client.automation.view.sdk.GlobalView;

public class ContainerPortletHasProperLocaleStep extends UiTestStep {
	private static final long serialVersionUID = 1L;
	private static final String IFRAME_SELECTOR = "//iframe[contains(@src,\"/ui/vic\")]";
	private static final String CONTAINER_PORTLET_TITLE_SELECTOR_FORMAT = "//span[contains(@title, \"%s\")]";
	private static final String NAME_TH_SELECTOR = "//vic-container-portlet/table/tbody/tr[1]/th";
	private static final String IMAGE_TH_SELECTOR = "//vic-container-portlet/table/tbody/tr[2]/th";
	private static final String PORTMAPPING_TH_SELECTOR = "//vic-container-portlet/table/tbody/tr[3]/th";
	private static final String LOCALE_PATH = "locale/%s/com_vmware_vic.properties";
	private static String BROWSER_LOCALE;

	@View
	GlobalView globalView;
		
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
		return String.format("Verifies if Container portlet shows information in correct locale");
	}

	@Override
	public void execute() throws Throwable {
		getLocale();
		final String localizedContainerPortletTitle = getLocalizedValue("container.label");
		final String localizedNameLabel = getLocalizedValue("container.name.label");
		final String localizedImageLabel = getLocalizedValue("container.image.label");
		final String localizedPortmappingLabel = getLocalizedValue("container.portmapping.label");
		final String containerPortletTitleSelector = String.format(CONTAINER_PORTLET_TITLE_SELECTOR_FORMAT, localizedContainerPortletTitle);
		
		verify.fatal(getDriver().findElement(By.xpath(containerPortletTitleSelector)).getText(),
				localizedContainerPortletTitle,
				String.format("Container portlet label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedContainerPortletTitle));
		switchToIframe();
		
		verify.safely(getDriver().findElement(By.xpath(NAME_TH_SELECTOR)).getText(),
				localizedNameLabel,
				String.format("Container name label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedNameLabel));
		verify.safely(getDriver().findElement(By.xpath(IMAGE_TH_SELECTOR)).getText(),
				localizedImageLabel,
				String.format("Container image label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedImageLabel));
		try {
			verify.safely(getDriver().findElement(By.xpath(PORTMAPPING_TH_SELECTOR)).getText(),
					localizedPortmappingLabel,
					String.format("Container port mapping label for locale \"%s\" should be \"%s\"", BROWSER_LOCALE, localizedPortmappingLabel));
		} catch (Exception e) {
			System.out.println("This container does not have any port mapping information");
		}
	}

}
