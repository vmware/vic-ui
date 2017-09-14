package com.vmware.vsphere.client.automation.testbed;

import com.vmware.automation.core.annotation.TestbedInfo;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.vsphere.client.automation.core.spec.SingleValueSpec;
import com.vmware.vsphere.client.automation.core.spec.VmSpec;

/**
 * Defines VIC testbed to be used in vSphere tests
 */

@TestbedInfo(version = 1)
public class VicTestbed extends Testbed {
	
	private static final long serialVersionUID = 1L;
	
	/*
	 * Spec defining VCH VM 
	 */
	public VmSpec vchVmSpec;
	
	/*
	 * Spec defining test Container VM 
	 */
	public VmSpec containerVmSpec;
}
