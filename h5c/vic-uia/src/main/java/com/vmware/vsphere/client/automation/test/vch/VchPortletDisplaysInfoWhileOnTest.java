package com.vmware.vsphere.client.automation.test.vch;

import com.vmware.automation.core.annotation.RequiresTestbed;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.automation.core.testbed.ITestbedRequester.TestbedAllocation;
import com.vmware.automation.core.workflow.IWorkflowSpec;
import com.vmware.automation.core.workflow.StepComposition;
import com.vmware.automation.core.workflow.WorkflowStep;
import com.vmware.vim.binding.vim.VirtualMachine.PowerState;
import com.vmware.vsphere.client.automation.component.navigation.ObjectNavigator;
import com.vmware.vsphere.client.automation.component.navigation.TabNavigator;
import com.vmware.vsphere.client.automation.component.tasks.RecentTaskFilterSpec;
import com.vmware.vsphere.client.automation.component.tasks.RecentTaskStatus;
import com.vmware.vsphere.client.automation.constants.L10NVmConst;
import com.vmware.vsphere.client.automation.core.spec.SingleValueSpec;
import com.vmware.vsphere.client.automation.core.spec.VmSpec;
import com.vmware.vsphere.client.automation.spec.PortletSpec;
import com.vmware.vsphere.client.automation.step.common.MaximizeWindowStep;
import com.vmware.vsphere.client.automation.step.common.VerifyPortletVisibilityStep;
import com.vmware.vsphere.client.automation.step.common.VicCommon;
import com.vmware.vsphere.client.automation.step.srv.vm.SetVmPowerStateByApiStep;
import com.vmware.vsphere.client.automation.step.ui.ClarityAlertClickYesStep;
import com.vmware.vsphere.client.automation.step.ui.ConfirmClarityDialogStep;
import com.vmware.vsphere.client.automation.step.ui.InvokeActionMenuItemStep;
import com.vmware.vsphere.client.automation.step.ui.VerifyRecentTaskStep;
import com.vmware.vsphere.client.automation.step.vch.VerifyVchPortletContentStep;
import com.vmware.vsphere.client.automation.test.WebClientTest;
import com.vmware.vsphere.client.automation.testbed.HostTestbed;
import com.vmware.vsphere.client.automation.testbed.SingleNgcTestbed;
import com.vmware.vsphere.client.automation.testbed.VicTestbed;

/**
 * VCH Portlet Displays Info While On Test:
 * 1. Make sure Virtual Container Host VM is at poweredOff state
 * 2. Navigate to VM and open Summary tab
 * 3. Turn on VM and wait the powerOn task is done
 * 4. Verify portlet 'Virtual Container Host' exists
 * 5. Verify portlet 'Virtual Container Host' displays a correct value for Docker API endpoint
 * 6. Verify portlet 'Virtual Container Host' displays a correct value for VCH Admin portal
*/
public class VchPortletDisplaysInfoWhileOnTest extends WebClientTest {
	@RequiresTestbed(clazz = SingleNgcTestbed.class, allocation = TestbedAllocation.SHARED)
	private Testbed _singleNgcTestbed;

	@RequiresTestbed(clazz = HostTestbed.class)
	private HostTestbed _hostTestbed;

	@RequiresTestbed(clazz = VicTestbed.class)
	private VicTestbed _vicTestbed;
	
	private SingleValueSpec<PowerState> _poweredOnSpec = new SingleValueSpec<PowerState>(PowerState.poweredOn);
	private VmSpec _vchVmSpec;
	private PortletSpec _vchPortletSpec;
	private RecentTaskFilterSpec _powerOnVMTaskSpec;

	@Override
	public String getDescription() {
		return String.format("Checks if VCH portlet displays valid values while VM is on");
	}
	
	@Override
	protected void addSpecsToWorkflow(IWorkflowSpec specsToAdd) {
		super.addSpecsToWorkflow(specsToAdd);
		
		_vchVmSpec = _vicTestbed.vchVmSpec;
		_vchPortletSpec = VicCommon.buildPortletSpec(VicCommon.VCH_PORTLET_TITLE);

		_powerOnVMTaskSpec = new RecentTaskFilterSpec(
				L10NVmConst.Task.POWER_ON_VM,
				_vchVmSpec.getName(),
				RecentTaskStatus.COMPLETED
		);
		
		specsToAdd.addSpec(_vchVmSpec, _vchPortletSpec, _powerOnVMTaskSpec, _poweredOnSpec);
	}
	
	@Override
	protected void addSetupSteps(StepComposition<WorkflowStep> steps) {
		steps.add(new SetVmPowerStateByApiStep(PowerState.poweredOff), _vchVmSpec);
		steps.add(new MaximizeWindowStep());
	}

	@Override
	protected void addTestSteps(StepComposition<WorkflowStep> steps) {
		steps
			.add(new ObjectNavigator(L10NVmConst.Navigator.VC_INVENTORY_LISTS))
			.add(new ObjectNavigator(L10NVmConst.Navigator.VMS))
			.add(new ObjectNavigator(_vicTestbed.vchVmSpec.getName()))
			.add(new TabNavigator(L10NVmConst.Tab.SUMMARY))
			.add(new InvokeActionMenuItemStep(L10NVmConst.Action.POWER, L10NVmConst.Action.POWER_ON))
			.add(new ClarityAlertClickYesStep())
			.add(new VerifyRecentTaskStep())
			.add(new VerifyPortletVisibilityStep(), _vchVmSpec)
			.add(new VerifyVchPortletContentStep(), _poweredOnSpec);
	}

}
