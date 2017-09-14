package com.vmware.vsphere.client.automation.test.common;

import com.vmware.automation.core.annotation.RequiresTestbed;
import com.vmware.automation.core.testbed.Testbed;
import com.vmware.automation.core.testbed.ITestbedRequester.TestbedAllocation;
import com.vmware.automation.core.workflow.StepComposition;
import com.vmware.automation.core.workflow.WorkflowStep;
import com.vmware.vsphere.client.automation.component.navigation.HomeNavigator;
import com.vmware.vsphere.client.automation.test.WebClientTest;
import com.vmware.vsphere.client.automation.testbed.HostTestbed;
import com.vmware.vsphere.client.automation.testbed.SingleNgcTestbed;
import com.vmware.vsphere.client.automation.testbed.VicTestbed;

/**
 * Do Nothing Except Login Test:
 * The purpose of this test is to ensure resources data such as
 * locale are loaded and referenced properly by the actual test cases
 * by simply logging into the H5 Client and then logging out  
 */
public class DoNothingExceptLoginTest extends WebClientTest {
    @RequiresTestbed(clazz = SingleNgcTestbed.class, allocation = TestbedAllocation.SHARED)
    private Testbed _singleNgcTestbed;

    @RequiresTestbed(clazz = HostTestbed.class)
    private HostTestbed _hostTestbed;

    @RequiresTestbed(clazz = VicTestbed.class)
    private VicTestbed _vicTestbed;
    
    @Override
    public String getDescription() {
        return String.format("%s", "Navigates to the home navigator");
    }
    
    @Override
    protected void addTestSteps(StepComposition<WorkflowStep> steps) {
        steps.add(new HomeNavigator());
    }
}
