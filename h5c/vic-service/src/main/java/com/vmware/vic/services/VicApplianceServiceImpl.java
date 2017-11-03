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
package com.vmware.vic.services;

import com.vmware.vic.PropFetcher;
import com.vmware.vim25.InvalidPropertyFaultMsg;
import com.vmware.vim25.RuntimeFaultFaultMsg;

public class VicApplianceServiceImpl implements VicApplianceService {
    private final PropFetcher _propFetcher;

    public VicApplianceServiceImpl (
            PropFetcher propFetcher) {
        if (propFetcher == null) {
            throw new IllegalArgumentException("constructor argument cannot be null");
        }
        _propFetcher = propFetcher;
    }

    @Override
    public String[] getVicAppliancesList() {
        String[] results = null;
        try {
            results = _propFetcher.getVicApplianceVms().toArray(new String[]{});
        } catch (RuntimeFaultFaultMsg | InvalidPropertyFaultMsg e) {
            e.printStackTrace();
        }
        return results;
    }
}
