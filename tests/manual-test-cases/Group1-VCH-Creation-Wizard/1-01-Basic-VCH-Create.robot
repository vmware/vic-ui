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

# TODO externalize vars

*** Settings ***
Documentation  Test 1-01 - Basic VCH Create
Resource  ../../resources/Util.robot
Resource  ../Group18-VIC-UI/vicui-common.robot
Suite Setup  Prepare Testbed
Test Teardown  Cleanup Testbed

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot
${OVA_ESX_HOST_6.5d}  10.160.217.137
${OVA_ESX_HOST_6.0u2}  10.161.27.49

*** Keywords ***
Prepare Testbed
    # Force the WD to be vic-ui/
    ${wd}=  Run  pwd
    @{wd_split}=  Split String  ${wd}  /
    ${wd_level_len}=  Get Length  ${wd_split}
    ${last_level_idx}=  Evaluate  ${wd_level_len} - 1
    ${current_folder}=  Get From List  ${wd_split}  ${last_level_idx}
    Run Keyword Unless  '${current_folder}' == 'vic-ui'  Fatal Error  Test script should be run from vic-ui/

    # Check drone CLI
    ${rc}  ${drone_ver}=  Run And Return Rc And Output  drone --version 2>&1
    Log  Checking Drone version...
    Log  return code: ${rc}, output: ${drone_ver}  DEBUG
    Run Keyword If  ${rc} > ${0}  Fatal Error  Drone is required to run tests!
    Run Keyword If  '0.5.0' not in '${drone_ver}'  Fatal Error  Drone 0.5.0 is required to run tests!

    # Check govc
    ${rc}=  Run And Return Rc  govc
    Should Be True  ${rc} != 127

    # Install VIC Product OVA  6.0u2  ${BUILD_3634791_IP}  10.161.27.49  datastore1 (1)
    # Install VIC Product OVA  6.5d  ${BUILD_5318154_IP}  10.160.217.137  datastore1 (4)
    Install VIC Product OVA  6.0u2  ${BUILD_3634791_IP}  ${OVA_ESX_HOST_60_IP}  ${OVA_ESX_60_DS}
    Install VIC Product OVA  6.5d  ${BUILD_5318154_IP}  ${OVA_ESX_HOST_65_IP}  ${OVA_ESX_65_DS}

    Get Vic Engine Binaries

Reboot vSphere Client
    # reboot vsphere client after installing the plugin
    Open Connection  ${BUILD_5318154_IP}  prompt=#
    Login  root  vmware
    Execute Command  service-control --stop vsphere-ui
    Execute Command  service-control --start vsphere-ui

    # wait until vsphere-ui service is up and running
    Wait Until Keyword Succeeds  20x  30s  Is vSphere Client Ready
    Log To Console  vSphere Client has booted.
    Close connection

Is vSphere Client Ready
    Log To Console  Waiting until vSphere Client is up and ready...
    ${out}=  Run  curl -sL https://${TEST_VC_IP}/ui/ -k
    ${out_len}=  Get Length  ${out}
    Should Be True  ${out_len} > 0
    Should Not Contain  ${out}  Service Unavailable
    Should Not Contain  ${out}  is still initializing

Cleanup Testbed
    Close All Browsers
    Log To Console  Removing VIC UI plugins from %{TEST_VCSA_BUILD}...
    # remove plugins
    ${vic-ui-binary}=  Set Variable  ../../../vic-ui-linux
    Run  ${vic-ui-binary} remove --thumbprint %{VC_FINGERPRINT} --target ${TEST_VC_IP} --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --key com.vmware.vic.ui
    Run  ${vic-ui-binary} remove --thumbprint %{VC_FINGERPRINT} --target ${TEST_VC_IP} --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --key com.vmware.vic

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
    Reboot vSphere Client

    Log To Console  OVA IP is %{OVA_IP_6.5d}
    ${protractor_conf}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/protractor.conf.js
    Set Global Variable  ${original_protractor_conf}  ${protractor_conf}
    ${rc}  ${out}=  Run And Return Rc And Output  sed -e "s|.*baseUrl.*|baseUrl: 'https:\/\/${BUILD_5318154_IP}\/ui',|" -e "s|.*directConnect.*|seleniumAddress: 'http:\/\/${WINDOWS_HOST_IP}:4444\/wd\/hub',|" h5c/vic/src/vic-webapp/protractor.conf.js > /tmp/protractor.conf.js
    Should Be Equal As Integers  ${rc}  0
    Run Keyword Unless  ${rc} == 0  Log  ${out}
    Run  cp /tmp/protractor.conf.js ./h5c/vic/src/vic-webapp/

    ${app_po_ts}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/e2e/app.po.ts
    Set Global Variable  ${original_app_po_ts}  ${app_po_ts}
    ${rc}  ${out}=  Run And Return Rc And Output  sed -e "s|.*return browser\.get\(.*|return browser\.get\('https:\/\/${BUILD_5318154_IP}\/ui'\);|" h5c/vic/src/vic-webapp/e2e/app.po.ts > /tmp/app.po.ts
    Should Be Equal As Integers  ${rc}  0
    Run Keyword Unless  ${rc} == 0  Log  ${out}
    Run  cp /tmp/app.po.ts ./h5c/vic/src/vic-webapp/e2e/

    ${rc}  ${out}=  Run And Return Rc And Output  cd h5c/vic/src/vic-webapp && yarn && npm run e2e
    Log  ${out}
    Log To Console  ${out}
    Should Be Equal As Integers  ${rc}  0
