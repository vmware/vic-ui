# Copyright 2018 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License

*** Settings ***
Documentation  Test 1-02 - Multi DVS VCH Create
Resource  ../../resources/Util.robot
Resource  ../Group18-VIC-UI/vicui-common.robot
Suite Setup  Deploy Esxi And Prepare Testbed
Suite Teardown  Cleanup Testbed After Protractor Test Completes

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot
${ESX_NAME}  vicui-e2e-multi-dvs-esx

*** Keywords ***
Cleanup Testbed After Protractor Test Completes
    Delete VC Root CA

    # Delete all vic-machine generated artifacts
    Run  rm -rf VCH-0*

    # Revert some modified local files
    Run  git reset --hard HEAD 2>&1

    # Delete binaries
    Run  rm -rf vic*.tar.gz
    Run  rm -rf scripts/plugin-packages/com.vmware.vic-v1*
    Run  rm -rf scripts/vsphere-client-serenity/com.vmware.vic.ui-v1*

    # delete plugins from VC
    Cleanup Plugins From VC  ${TEST_VC_IP}  %{VC_FINGERPRINT}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}

    # delete all dangling VCHs
    Destroy Dangling VCHs Created By Protractor  ${TEST_VC_IP}  %{VC_FINGERPRINT}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}

    Run  govc object.destroy '/Datacenter/network/DSwitch 2'
    Run  govc host.remove -dc=Datacenter -host.ip=%{STANDALONE_ESX1_IP}

    # kill nimbus esxi created for this test suite
    ${out}=  Destroy Testbed  %{NIMBUS_USER}-${ESX_NAME}

Deploy Esxi And Prepare Testbed
    Prepare Testbed For Protractor Tests
    ${vm_name}  ${vm_ip}=  Deploy ESXi On Nimbus And Get Info  ${ESX_NAME}  5969303
    Set Environment Variable  STANDALONE_ESX1_IP  ${vm_ip}
    Set Environment Variable  GOVC_URL  ${TEST_VC_IP}
    Set Environment Variable  GOVC_USERNAME  ${TEST_VC_USERNAME}
    Set Environment Variable  GOVC_PASSWORD  ${TEST_VC_PASSWORD}

    # Add %{STANDALONE_ESX1_IP} to VC
    Run  govc host.remove -dc=Datacenter -host.ip=%{STANDALONE_ESX1_IP}
    ${rc}  ${out}=  Run And Return Rc And Output  govc host.add -dc=Datacenter -hostname %{STANDALONE_ESX1_IP} -username root -password e2eFunctionalTest -noverify
    Should Be Equal As Integers  ${rc}  0

*** Test Cases ***
[ Windows 10 - Chrome ] Create a VCH on a Multi Distributed Switches Environment
    # create a new distributed switch and add a new host
    Run  govc object.destroy '/Datacenter/network/DSwitch 2'
    ${rc}=  Run And Return Rc  govc dvs.create -dc=Datacenter 'DSwitch 2'
    Should Be Equal As Integers  ${rc}  0

    # create port groups: net1, net2
    ${rc}  ${out}=  Run And Return Rc And Output  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs='DSwitch 2' net1
    Log To Console  ${out}
    Should Be Equal As Integers  ${rc}  0

    ${rc}  ${out}=  Run And Return Rc And Output  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs='DSwitch 2' net2
    Log To Console  ${out}
    Should Be Equal As Integers  ${rc}  0

    # add %{STANDALONE_ESX1_IP} to DSwitch 2
    ${rc}  ${out}=  Run And Return Rc And Output  govc dvs.add -dvs='DSwitch 2' -pnic=vmnic1 -host.ip=%{STANDALONE_ESX1_IP} %{STANDALONE_ESX1_IP}
    Log To Console  ${out}
    Should Be Equal As Integers  ${rc}  0

    # install the plugin only the first time
    Set Absolute Script Paths  ./scripts
    Force Install Vicui Plugin  .
    Reboot vSphere Client  ${TEST_VC_IP}

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  chrome

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && export STANDALONE_ESX1_IP=%{STANDALONE_ESX1_IP} && npm run e2e -- --specs=e2e/vch-create-wizard/2-multi-dvswitch.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0
