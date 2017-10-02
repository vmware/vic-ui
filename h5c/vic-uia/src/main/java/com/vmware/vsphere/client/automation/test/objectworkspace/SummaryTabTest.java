package com.vmware.vsphere.client.automation.test.objectworkspace;

import com.vmware.automation.core.annotation.RequiresTestbed;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.automation.core.testbed.ITestbedRequester.TestbedAllocation;
import com.vmware.automation.core.workflow.StepComposition;
import com.vmware.automation.core.workflow.WorkflowStep;
import com.vmware.vsphere.client.automation.component.navigation.HomeNavigator;
import com.vmware.vsphere.client.automation.step.common.MaximizeWindowStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.OpenVicWorkspaceLandingPageStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.OpenWorkspaceByHomeShortcutStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifySuccessfulEntryStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifyUiVersionStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifyVchNumberStep;
import com.vmware.vsphere.client.automation.step.objectworkspace.VerifyVendorStep;
import com.vmware.vsphere.client.automation.test.WebClientTest;
import com.vmware.vsphere.client.automation.testbed.HostTestbed;
import com.vmware.vsphere.client.automation.testbed.SingleNgcTestbed;
import com.vmware.vsphere.client.automation.testbed.VicTestbed;

public class SummaryTabTest extends WebClientTest {

	@RequiresTestbed(clazz = SingleNgcTestbed.class, allocation = TestbedAllocation.SHARED)
	private Testbed _singleNgcTestbed;

	@RequiresTestbed(clazz = HostTestbed.class)
	private HostTestbed _hostTestbed;

	@RequiresTestbed(clazz = VicTestbed.class)
	private VicTestbed _vicTestbed;

	@Override
	public String getDescription() {
		return String.format("%s", "Tests the Summary tab of VIC Workspace functionality");
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
		steps.add(new OpenVicWorkspaceLandingPageStep());
		steps.add(new VerifyUiVersionStep());
		steps.add(new VerifyVchNumberStep());
		steps.add(new VerifyVendorStep());
	}

}
