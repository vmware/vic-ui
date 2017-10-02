package com.vmware.vsphere.client.automation.vicui.plugininstalled.spec;

import com.vmware.vsphere.client.automation.components.navigator.NGCNavigator;
import com.vmware.vsphere.client.automation.components.navigator.spec.NGCLocationSpec;

public class AdminNavigationSpec extends NGCLocationSpec {
	private static final String NID_ADMINISTRATION_CLIENT_PLUGINS = "administration.client.plugins";

	public AdminNavigationSpec() {
		super(NGCNavigator.NID_HOME_ADMINISTRATION, NID_ADMINISTRATION_CLIENT_PLUGINS);
	}
}
