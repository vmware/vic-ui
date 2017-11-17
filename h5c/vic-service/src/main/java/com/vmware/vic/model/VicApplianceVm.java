/*

Copyright 2017 VMware, Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
package com.vmware.vic.model;

import com.vmware.vic.model.constants.BaseVm;
import com.vmware.vim25.DynamicProperty;
import com.vmware.vim25.ManagedObjectReference;
import com.vmware.vim25.ObjectContent;
import com.vmware.vim25.VirtualMachineConfigSummary;
import com.vmware.vim25.VirtualMachineGuestSummary;
import com.vmware.vim25.VirtualMachineSummary;

public class VicApplianceVm {
    private String name;
    private String moId;
    private String ipAddress;

    public VicApplianceVm(ObjectContent objContent) {
        if (objContent == null) {
            throw new IllegalArgumentException("constructor argument cannot be null");
        }

        VirtualMachineSummary vmSummary = null;
        for (DynamicProperty dp : objContent.getPropSet()) {
            String key = dp.getName();
            if (key.equals(BaseVm.VM_NAME)) {
                name = (String) dp.getVal();
                continue;
            }

            if (key.equals(BaseVm.VM_SUMMARY)) {
                vmSummary = (VirtualMachineSummary) dp.getVal();
            }
        }

        if (vmSummary != null) {
            ManagedObjectReference vmMor = vmSummary.getVm();
            moId = vmMor.getValue();
            VirtualMachineGuestSummary guestSummary = vmSummary.getGuest();
            ipAddress = guestSummary.getIpAddress();
            VirtualMachineConfigSummary summaryConfig = vmSummary.getConfig();
            //                             VAppProductInfo vAppProductInfo = summaryConfig.getProduct();
        }
    }

    public String getName() {
        return name;
    }

    public String getMoId() {
        return moId;
    }

    public String getIpAddress() {
        return ipAddress;
    }
}
