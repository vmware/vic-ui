# Copyright 2017 VMware, Inc. All Rights Reserved.
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
Documentation  Test 1-01 - Basic VCH Create
Resource  ../../resources/Util.robot
Resource  ../Group18-VIC-UI/vicui-common.robot
Suite Setup  Prepare Testbed For Protractor Tests And Install Plugin
Suite Teardown  Cleanup Testbed After Protractor Test Completes

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot

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

    # ensure extra objects are not present in VC inventory
    Run  govc object.destroy -dc Datacenter /Datacenter/host/Cluster2
    Run  govc object.destroy -dc Datacenter /Datacenter/host/Cluster3
    Run  govc object.destroy -dc Datacenter2 /Datacenter2

Prepare Testbed For Protractor Tests And Install Plugin
    Prepare Testbed For Protractor Tests
    Set Absolute Script Paths  ./scripts
    Force Install Vicui Plugin  .
    Reboot vSphere Client  ${TEST_VC_IP}

*** Test Cases ***
[ Windows 10 - Chrome ] Create And Delete VCH On A Single Cluster Environment
    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  chrome

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ Windows 10 - Firefox ] Create And Delete VCH On A Single Cluster Environment
    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  firefox

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ Windows 10 - IE11 ] Create And Delete VCH On A Single Cluster Environment
    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  internet explorer

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ MacOS - Chrome ] Create And Delete VCH On A Single Cluster Environment
    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${MACOS_HOST_IP}  chrome

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ MacOS - Firefox ] Create And Delete VCH On A Single Cluster Environment
    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${MACOS_HOST_IP}  firefox

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ SKIPPED - See https://github.com/vmware/vic-ui/issues/274 ] Create And Delete VCH On An Environment With Some Empty Clusters
    Log To Console  Skipping because v1.3.0 GA doesn't have the fix and will always fail. See https://github.com/vmware/vic-ui/issues/274 for details

    # add clusters
    #${out}=  Run  govc cluster.create -dc=Datacenter Cluster2
    #Should Be Empty  ${out}
    #${out}=  Run  govc cluster.create -dc=Datacenter Cluster3
    #Should Be Empty  ${out}

    #Log To Console  Log To Console  OVA IP is %{OVA_IP}
    #Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  chrome

    # run protractor
    #${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    #Log  ${out}
    #Log To Console  ${out}

    # report pass/fail
    #Should Be Equal As Integers  ${rc}  0

[ Windows 10 - Chrome ] Create And Delete VCH On A Multi-DC Environment
    # add a new datacenter and an empty cluster to it
    ${out}=  Run  govc datacenter.create Datacenter2
    Should Be Empty  ${out}
    ${out}=  Run  govc cluster.create -dc=Datacenter2 Cluster
    Should Be Empty  ${out}
    ${out}=  Run  govc cluster.change -dc=Datacenter2 -drs-enabled=true /Datacenter2/host/Cluster
    Should Be Empty  ${out}

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  chrome

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ Windows 10 - Firefox ] Create And Delete VCH On A Multi-DC Environment
    # datacenter might already exist, but try creating it again and continue in case something went wrong from the previous case
    ${out}=  Run  govc datacenter.create Datacenter2
    ${out}=  Run  govc cluster.create -dc=Datacenter2 Cluster
    ${out}=  Run  govc cluster.change -dc=Datacenter2 -drs-enabled=true /Datacenter2/host/Cluster

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  firefox

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ Windows 10 - IE11 ] Create And Delete VCH On A Multi-DC Environment
    # datacenter might already exist, but try creating it again and continue in case something went wrong from the previous case
    ${out}=  Run  govc datacenter.create Datacenter2
    ${out}=  Run  govc cluster.create -dc=Datacenter2 Cluster
    ${out}=  Run  govc cluster.change -dc=Datacenter2 -drs-enabled=true /Datacenter2/host/Cluster

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${WINDOWS_HOST_IP}  internet explorer

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ MacOS - Chrome ] Create And Delete VCH On A Multi-DC Environment
    # datacenter might already exist, but try creating it again and continue in case something went wrong from the previous case
    ${out}=  Run  govc datacenter.create Datacenter2
    ${out}=  Run  govc cluster.create -dc=Datacenter2 Cluster
    ${out}=  Run  govc cluster.change -dc=Datacenter2 -drs-enabled=true /Datacenter2/host/Cluster

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${MACOS_HOST_IP}  chrome

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0

[ MacOS - Firefox ] Create And Delete VCH On A Multi-DC Environment
    # datacenter might already exist, but try creating it again and continue in case something went wrong from the previous case
    ${out}=  Run  govc datacenter.create Datacenter2
    ${out}=  Run  govc cluster.create -dc=Datacenter2 Cluster
    ${out}=  Run  govc cluster.change -dc=Datacenter2 -drs-enabled=true /Datacenter2/host/Cluster

    Log To Console  OVA IP is %{OVA_IP}
    Prepare Protractor  ${TEST_VC_IP}  ${MACOS_HOST_IP}  firefox

    # run protractor
    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e -- --specs=e2e/vch-create-wizard/1-basic.e2e-spec.ts
    Log  ${out}
    Log To Console  ${out}

    # report pass/fail
    Should Be Equal As Integers  ${rc}  0
