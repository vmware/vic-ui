package com.vmware.vsphere.client.automation.test.objectworkspace;

import com.vmware.automation.core.annotation.RequiresTestbed;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.automation.core.testbed.ITestbedRequester.TestbedAllocation;
import com.vmware.automation.core.workflow.StepComposition;
import com.vmware.automation.core.workflow.WorkflowStep;
import com.vmware.vsphere.client.automation.component.navigation.HomeNavigator;
import com.vmware.vsphere.client.automation.component.navigation.ObjectNavigator;
import com.vmware.vsphere.client.automation.constants.L10NVmConst;
import com.vmware.vsphere.client.automation.step.common.MaximizeWindowStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.OpenWorkspaceByGIListStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.OpenWorkspaceByHomeShortcutStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifySuccessfulEntryStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifyVmNumbersStep;
import com.vmware.vsphere.client.automation.test.WebClientTest;
import com.vmware.vsphere.client.automation.testbed.HostTestbed;
import com.vmware.vsphere.client.automation.testbed.SingleNgcTestbed;
import com.vmware.vsphere.client.automation.testbed.VicTestbed;

/**
 * Entry Test:
 * 1. Navigate to the home screen
 * 2. Open VIC Workspace by clicking the shortcut
 * 3. Verify if the navigation was successful
 * 4. Navigate to the Global Inventory List
 * 5. Open VIC Workspace by clicking vSphere Integrated Containers in the inventory list
 * 6. Verify if the navigation was successful
 * 7. Check if data grid displays the right number of VCHs and Containers
*/
public class EntryTest extends WebClientTest {

	@RequiresTestbed(clazz = SingleNgcTestbed.class, allocation = TestbedAllocation.SHARED)
	private Testbed _singleNgcTestbed;

	@RequiresTestbed(clazz = HostTestbed.class)
	private HostTestbed _hostTestbed;

	@RequiresTestbed(clazz = VicTestbed.class)
	private VicTestbed _vicTestbed;

	@Override
	public String getDescription() {
		return String.format("%s", "Checks if VIC Object Workspace can be accessed");
	}

	@Override
	protected void addSetupSteps(StepComposition<WorkflowStep> steps) {
		steps.add(new MaximizeWindowStep());
	}

	@Override
	protected void addTestSteps(StepComposition<WorkflowStep> steps) {
		steps.add(new HomeNavigator());
		steps.add(new OpenWorkspaceByHomeShortcutStep());
		steps.add(new VerifySuccessfulEntryStep());
		steps.add(new HomeNavigator());
		steps.add(new ObjectNavigator(L10NVmConst.Navigator.VC_INVENTORY_LISTS));
		steps.add(new OpenWorkspaceByGIListStep());
		steps.add(new VerifySuccessfulEntryStep());
		steps.add(new VerifyVmNumbersStep());
	}

}
