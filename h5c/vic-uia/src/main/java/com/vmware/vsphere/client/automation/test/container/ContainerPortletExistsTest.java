package com.vmware.vsphere.client.automation.test.container;

import com.vmware.automation.core.annotation.RequiresTestbed;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.automation.core.testbed.ITestbedRequester.TestbedAllocation;
import com.vmware.automation.core.workflow.IWorkflowSpec;
import com.vmware.automation.core.workflow.StepComposition;
import com.vmware.automation.core.workflow.WorkflowStep;
import com.vmware.vsphere.client.automation.component.navigation.ObjectNavigator;
import com.vmware.vsphere.client.automation.component.navigation.TabNavigator;
import com.vmware.vsphere.client.automation.constants.L10NVmConst;
import com.vmware.vsphere.client.automation.spec.PortletSpec;
import com.vmware.vsphere.client.automation.step.common.MaximizeWindowStep;
import com.vmware.vsphere.client.automation.step.common.VerifyPortletVisibilityStep;
import com.vmware.vsphere.client.automation.step.common.VicCommon;
import com.vmware.vsphere.client.automation.step.container.ContainerPortletHasProperLocaleStep;
import com.vmware.vsphere.client.automation.step.ui.VerifyLoadingIsDoneStep;
import com.vmware.vsphere.client.automation.test.WebClientTest;
import com.vmware.vsphere.client.automation.testbed.HostTestbed;
import com.vmware.vsphere.client.automation.testbed.SingleNgcTestbed;
import com.vmware.vsphere.client.automation.testbed.VicTestbed;

/**
 * TODO: update VicTestbed and this test case such that it has image name and portmapping information that can be tested in HSUIA
 *  
 * Container Portlet Exists Test:
 * 1. Navigate to Container VM
 * 2. Verify portlet 'Container' exists
 * 3. Verify if portlet displays information in proper locale
*/
public class ContainerPortletExistsTest extends WebClientTest {
	@RequiresTestbed(clazz = SingleNgcTestbed.class, allocation = TestbedAllocation.SHARED)
	private Testbed _singleNgcTestbed;

	@RequiresTestbed(clazz = HostTestbed.class)
	private HostTestbed _hostTestbed;

	@RequiresTestbed(clazz = VicTestbed.class)
	private VicTestbed _vicTestbed;
	
	private static String CONTAINER_VM_TITLE;
	private PortletSpec _containerPortletSpec;
	
	@Override
	protected void addSpecsToWorkflow(IWorkflowSpec specsToAdd) {
		super.addSpecsToWorkflow(specsToAdd);
		CONTAINER_VM_TITLE = _vicTestbed.containerVmSpec.getName();
		_containerPortletSpec = VicCommon.buildPortletSpec(VicCommon.CONTAINER_PORTLET_TITLE);
		specsToAdd.addSpec(_containerPortletSpec);
	}
	
	@Override
	public String getDescription() {
		return String.format("Checking if Container portlet exists");
	}

	@Override
	protected void addSetupSteps(StepComposition<WorkflowStep> steps) {
		steps.add(new MaximizeWindowStep());
	}

	@Override
	protected void addTestSteps(StepComposition<WorkflowStep> steps) {
		steps
		.add(new ObjectNavigator(L10NVmConst.Navigator.VC_INVENTORY_LISTS))
		.add(new ObjectNavigator(L10NVmConst.Navigator.VMS))
		.add(new ObjectNavigator(CONTAINER_VM_TITLE))
		.add(new TabNavigator(L10NVmConst.Tab.SUMMARY))
		.add(new VerifyLoadingIsDoneStep())
		.add(new VerifyPortletVisibilityStep(), _containerPortletSpec)
		.add(new ContainerPortletHasProperLocaleStep());
	}

}
