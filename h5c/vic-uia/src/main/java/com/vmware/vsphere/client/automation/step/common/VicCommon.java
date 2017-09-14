package com.vmware.vsphere.client.automation.step.common;

import com.vmware.vsphere.client.automation.spec.PortletSpec;

public class VicCommon {
	public static final String VCH_PORTLET_TITLE = "Virtual Container Host";
	public static final String CONTAINER_PORTLET_TITLE = "Container";
	
	public static PortletSpec buildPortletSpec(String name) {
		PortletSpec pSpec = new PortletSpec();
		pSpec.setTitle(name);
		pSpec.setIsExpectedToExist(true);
		
		return pSpec;
	}
}
