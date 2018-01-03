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
Suite Setup  Prepare Testbed For Protractor Tests
Test Teardown  Cleanup Testbed After Protractor Test Completes

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot

*** Keywords ***
Cleanup Testbed After Protractor Test Completes
    # delete plugins from VC
    Cleanup Plugins From VC  ${TEST_VC_IP}  %{VC_FINGERPRINT}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}

    # revert protractor.conf.js
    OperatingSystem.Create File  ./h5c/vic/src/vic-webapp/protractor.conf.js  ${original_protractor_conf}

    # revert app.po.ts
    OperatingSystem.Create File  ./h5c/vic/src/vic-webapp/e2e/app.po.ts  ${original_app_po_ts}

*** Test Cases ***
Test On vSphere 6.5d
    # install VCH and VIC UI plugin
    Set Environment Variable  TEST_VCSA_BUILD  5318154
    Set Environment Variable  TEST_VSPHERE_VER  65
    Set Environment Variable  VC_FINGERPRINT  ${VC_FINGERPRINT_5318154}
    Set Global Variable  ${TEST_VC_IP}  ${BUILD_5318154_IP}
    Set Global Variable  ${TEST_VC_USERNAME}  administrator@vsphere.local
    Set Global Variable  ${TEST_VC_PASSWORD}  Admin!23

    Set Absolute Script Paths  ./scripts
    Force Install Vicui Plugin
    Reboot vSphere Client  ${TEST_VC_IP}

    Log To Console  OVA IP is %{OVA_IP_6.5d}
    Prepare Protractor  ${BUILD_5318154_IP}  ${WINDOWS_HOST_IP}

    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e
    Log  ${out}
    Log To Console  ${out}
    Should Be Equal As Integers  ${rc}  0
