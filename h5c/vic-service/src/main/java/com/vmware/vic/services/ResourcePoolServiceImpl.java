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

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.vmware.vic.model.constants.VsphereObjects;
import com.vmware.vic.mvc.ServicesController;
import com.vmware.vise.data.Constraint;
import com.vmware.vise.data.query.CompositeConstraint;
import com.vmware.vise.data.query.Comparator;
import com.vmware.vise.data.query.Conjoiner;
import com.vmware.vise.data.query.DataService;
import com.vmware.vise.data.query.PropertyConstraint;
import com.vmware.vise.data.query.QuerySpec;
import com.vmware.vise.data.query.RequestSpec;
import com.vmware.vise.data.query.Response;
import com.vmware.vise.data.ResourceSpec;
import com.vmware.vise.data.PropertySpec;

/**
 * Resource Pool Service implementation for checking the uniqueness of
 * a new ResourcePool (or VirtualApp) to be created by VCH life cycle
 * operations wizard
 */
public class ResourcePoolServiceImpl implements ResourcePoolService {
    private final static Log _logger = LogFactory.getLog(ResourcePoolServiceImpl.class);
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
     * @throws Exception
     */
    public boolean isNameUnique(String name) throws Exception {
        PropertyConstraint sameVappNameConstraint = createPropertyConstraint(
                VsphereObjects.VirtualApp,
                VsphereObjects.NamePropertyKey,
                Comparator.EQUALS,
                name);
        
        PropertyConstraint sameRpNameConstraint = createPropertyConstraint(
                VsphereObjects.ResourcePool,
                VsphereObjects.NamePropertyKey,
                Comparator.EQUALS,
                name);

        PropertyConstraint[] propConstraints = new PropertyConstraint[]{
                sameVappNameConstraint,
                sameRpNameConstraint
        };

        CompositeConstraint compConstraint =
                createCompositeConstraint(propConstraints, Conjoiner.OR);

        QuerySpec querySpec = new QuerySpec();
        querySpec.name = "check-name-uniqueness";

        querySpec.resourceSpec = createEmptyResourceSpec();

        querySpec.resourceSpec.constraint = compConstraint;

        RequestSpec requestSpec = new RequestSpec();
        requestSpec.querySpec = new QuerySpec[] { querySpec };

        Response response = _dataService.getData(requestSpec);
        if (response.resultSet[0].error != null) {
            _logger.error(response.resultSet[0].error);
            throw new Exception(response.resultSet[0].error);
        }
        if (response.resultSet[0].totalMatchedObjectCount > 0) {
            return false;
        }
        return true;
    }

    /**
     * Creates a PropertyConstraint
     *
     * @param objectType
     *    Type of object to retrieve.
     * @param propertyName
     *    Name of the property to be matched.
     * @param comparator
     *    The operator to use for comparison
     *    ('equals', 'unequals', etc.)
     * @param comparableValue
     *    The value to compare.
     *
     * @return
     *    A PropertyConstraint.
     */
    private PropertyConstraint createPropertyConstraint(
            String objectType,
            String propertyName,
            Comparator comparator,
            Object comparableValue) {

        PropertyConstraint constraint = new PropertyConstraint();
        constraint.targetType = objectType;
        constraint.propertyName = propertyName;
        constraint.comparator = comparator;
        constraint.comparableValue = comparableValue;

        return constraint;
    }

    /**
     * Creates a CompositeConstraint by given nested Constraints and
     * conjoiner between them.
     *
     * @param constraints
     *    Array of nested Constraints to add into the composite constraint.
     * @param conjoiner
     *    Conjoiner defining how to combine the nested Constraints.
     *    Can be "AND" or "OR".
     *
     * @return
     *    A CompositeConstraint.
     */
    private CompositeConstraint createCompositeConstraint(
            Constraint[] nestedConstraints,
            Conjoiner conjoiner) {

        // create the result constraint and initialize it
        CompositeConstraint compositeConstraint = new CompositeConstraint();
        compositeConstraint.nestedConstraints = nestedConstraints;
        compositeConstraint.conjoiner = conjoiner;

        return compositeConstraint;
    }

    /**
     * Creates an empty ResourceSpec without any additional
     * properties of that object.
     *
     * @return an empty ResourceSpec
     */
    private ResourceSpec createEmptyResourceSpec() {
        PropertySpec propSpec = new PropertySpec();
        propSpec.propertyNames = new String[] {};
        ResourceSpec resourceSpec = new ResourceSpec();
        resourceSpec.propertySpecs = new PropertySpec[] { propSpec };
        return resourceSpec;
    }
}
