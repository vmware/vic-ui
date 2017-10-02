#!/bin/bash
# Copyright 2016-2017 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

MVN_REPO_LOCATION=$1
SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
GOVC_VMINFO=`govc vm.info -u $VC_ADMIN_USERNAME@$VC_ADMIN_DOMAIN:$VC_ADMIN_PW@$VC_IP -k --vm.ip=$VCH_IP --json=true 2>&1`

if [[ $(echo $GOVC_VMINFO | grep -i "no such VM") ]] ; then
    echo "Error! Please make sure you provided a right IP for the VCH VM."
    echo "If the IP is correct, turn on the VM first"
    exit 1
fi

VCH_MOID=`echo $GOVC_VMINFO | jq .VirtualMachines[0].Self.Value | sed 's/\"//g'`
PROVIDERS_GENERATOR="$SCRIPT_DIR/support/runner-generateProviders"
GEN_ARGS="--admin.user=$VC_ADMIN_USERNAME --admin.domain=$VC_ADMIN_DOMAIN --admin.password=$VC_ADMIN_PW --selenium.ip=$SELENIUM_IP --selenium.port=$SELENIUM_PORT --browser.type=$BROWSER --workDir=$MVN_REPO_LOCATION --vc.ip=$VC_IP --host.ip=$HOST_IP --h5client.ip=$H5C_IP --h5client.port=$H5C_PORT --host.datastore_name=$HOST_DATASTORE_NAME --vch.name=$VCH_NAME --vch.moid=$VCH_MOID --container.name=$CONTAINER_NAME"

# Note: reverting back to manual entry of test suites, as there doesn't seem to be an optimal way
# to preserve a certain order of listing test suites such that we can ensure the solid run and more consistent outcomes. 
FOUND_TESTS=($(cd $SCRIPT_DIR/src/main/java && find com/vmware/vsphere/client/automation/test -name "*.java" | sed -e "s/\.java//g" -e "s|\/|\.|g"))
TESTS=(
    "com.vmware.vsphere.client.automation.test.common.DoNothingExceptLoginTest"
    "com.vmware.vsphere.client.automation.test.vch.VchPortletExistsTest"
    "com.vmware.vsphere.client.automation.test.vch.VchPortletDisplaysInfoWhileOffTest"
    "com.vmware.vsphere.client.automation.test.vch.VchPortletDisplaysInfoWhileOnTest"
    "com.vmware.vsphere.client.automation.test.objectworkspace.SummaryTabTest"
    "com.vmware.vsphere.client.automation.test.objectworkspace.EntryTest"
    "com.vmware.vsphere.client.automation.test.container.ContainerPortletExistsTest"
)

if [ ${#FOUND_TESTS[@]} != ${#TESTS[@]} ] ; then
    echo "${#FOUND_TESTS[@]} != ${#TESTS[@]}"
    echo Number of test cases doesn\'t match between the provided list and what were found in the file system! Please check the TESTS array and make sure you have listed test cases correctly
    exit 1
fi

echo "Generating testbed providers..."
echo "=================================="

CONCATENATED=""
for line in ${TESTS[@]} ; do
    CONCATENATED="$CONCATENATED $line"
done

$PROVIDERS_GENERATOR $GEN_ARGS $VC_ADMIN_PW_ARG $CONCATENATED
echo Added the following test cases: ${TESTS[*]}
