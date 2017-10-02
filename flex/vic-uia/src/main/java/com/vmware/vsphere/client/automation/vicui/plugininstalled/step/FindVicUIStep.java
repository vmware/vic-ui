package com.vmware.vsphere.client.automation.vicui.plugininstalled.step;

import com.vmware.client.automation.workflow.CommonUIWorkflowStep;
import com.vmware.suitaf.SUITA;
import com.vmware.suitaf.apl.IDGroup;

public class FindVicUIStep extends CommonUIWorkflowStep {
	private static final IDGroup ADMINISTRATION_CLIENTPLUGINS_VICUI = IDGroup.toIDGroup("automationName=vSphere Integrated Containers-FlexClient");
	
	@Override
	public void execute() throws Exception {
	    UI.condition.isFound(ADMINISTRATION_CLIENTPLUGINS_VICUI).await(SUITA.Environment.getPageLoadTimeout());
	    verifyFatal(UI.component.exists(ADMINISTRATION_CLIENTPLUGINS_VICUI), "Chekcing if VIC UI is installed properly");
	}
}
