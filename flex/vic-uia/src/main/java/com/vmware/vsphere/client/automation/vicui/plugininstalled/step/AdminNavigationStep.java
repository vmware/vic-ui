package com.vmware.vsphere.client.automation.vicui.plugininstalled.step;

import com.vmware.client.automation.workflow.CommonUIWorkflowStep;
import com.vmware.suitaf.SUITA;
import com.vmware.suitaf.apl.IDGroup;
import com.vmware.client.automation.vcuilib.commoncode.IDConstants;

public class AdminNavigationStep extends CommonUIWorkflowStep {
    private static IDGroup ID_ADMINISTRATION = IDGroup.toIDGroup("automationName=TreeNodeItem_vsphere.core.navigator.administration");
    private static IDGroup ID_CLIENT_PLUGINS = IDGroup.toIDGroup("automationName=" + IDConstants.OBJ_NAV_SOLUTION_PLUGIN_MANAGER_NODE_ITEM);

	@Override
	public void execute() throws Exception {
	    UI.condition.isFound(ID_ADMINISTRATION).await(SUITA.Environment.getPageLoadTimeout());
	    UI.component.click(ID_ADMINISTRATION);
        UI.condition.isFound(ID_CLIENT_PLUGINS).await(SUITA.Environment.getPageLoadTimeout());
        UI.component.click(ID_CLIENT_PLUGINS);
	}
}
