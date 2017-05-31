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

import com.vmware.vic.model.constants.VsphereObjects;
import com.vmware.vise.data.query.CompositeConstraint;
import com.vmware.vise.data.query.Conjoiner;
import com.vmware.vise.data.query.DataService;
import com.vmware.vise.data.query.PropertyConstraint;
import com.vmware.vise.data.query.QuerySpec;
import com.vmware.vise.data.query.QueryUtil;
import com.vmware.vise.data.query.RequestSpec;
import com.vmware.vise.data.query.Response;

/**
 * Resource Pool Service implementation for checking the uniqueness of
 * a new ResourcePool (or VirtualApp) to be created by VCH life cycle
 * operations wizard
 */
public class ResourcePoolServiceImpl implements ResourcePoolService {
    private DataService _dataService;

    public ResourcePoolServiceImpl(DataService dataService)
            throws IllegalArgumentException {
        _dataService = dataService;
    }

    /**
     * Checks if there is any VirtualApp or ResourcePool object with
     * the given "name"
     * @param name
     * @return true if no object with the given name exists, otherwise false
     */
    public boolean isNameUnique(String name) {
        PropertyConstraint sameVappNameConstraint =
                QueryUtil.createPropertyConstraint(
                    VsphereObjects.VirtualApp,
                    VsphereObjects.NamePropertyKey,
                    com.vmware.vise.data.query.Comparator.EQUALS,
                    name);
        PropertyConstraint sameRpNameConstraint =
                QueryUtil.createPropertyConstraint(
                    VsphereObjects.ResourcePool,
                    VsphereObjects.NamePropertyKey,
                    com.vmware.vise.data.query.Comparator.EQUALS,
                    name);
        PropertyConstraint[] propConstraints = new PropertyConstraint[]{
                sameVappNameConstraint,
                sameRpNameConstraint
        };

        CompositeConstraint compConstraint =
            QueryUtil.createCompositeConstraint(propConstraints, Conjoiner.OR);
        QuerySpec querySpec = new QuerySpec();
        querySpec.name = "check-name-uniqueness";
        querySpec.resourceSpec = QueryUtil.createEmptyResourceSpec();
        querySpec.resourceSpec.constraint = compConstraint;

        RequestSpec requestSpec = new RequestSpec();
        requestSpec.querySpec = new QuerySpec[] { querySpec };

        Response response = _dataService.getData(requestSpec);
        if (response.resultSet[0].totalMatchedObjectCount > 0) {
            return false;
        }
        return true;
    }
}
