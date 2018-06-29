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
Documentation  This resource contains any keywords dealing with web based operations being performed on a Vsphere instance

*** Keywords ***
Login To Vsphere UI
    [Arguments]  ${url}=%{TEST_URL}  ${username}=%{TEST_USERNAME}  ${password}=%{TEST_PASSWORD}
    Go To  ${url}
    Wait Until Element Is Visible And Enabled  username
    Wait Until Element Is Visible And Enabled  password

    Input Text  username  ${username}
    Input Text  password  ${password}

    Wait Until Element Is Visible And Enabled  submit

    Click Button  submit

    Wait Until Page Contains  Summary
    Wait Until Page Contains  Monitor
    Wait Until Page Contains  Configure
    Wait Until Page Contains  Permissions

Navigate To VCH Creation Wizard
    Wait Until Element Is Visible And Enabled  action-homeMenu
    Click Element  action-homeMenu

    Wait Until Element Is Visible And Enabled  xpath=//*[@id="homeMenu-vsphere.core.navigator.shortcuts"]
    Click Element  xpath=//*[@id="homeMenu-vsphere.core.navigator.shortcuts"]

    Wait Until Element Is Visible And Enabled  css=span.com_vmware_vic-home-shortcut-icon
    Click Element  css=span.com_vmware_vic-home-shortcut-icon
    
    Wait Until Element Is Visible And Enabled  css=span[title='vSphere Integrated Containers']
    Click Element  css=span[title='vSphere Integrated Containers']

    Wait Until Page Contains  Summary
    Wait Until Page Contains  Virtual Container Hosts
    Wait Until Page Contains  Containers

Prepare Testbed For Protractor Tests
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

    # Make sure the govc binary exists (it should not return RC 127)
    ${rc}=  Run And Return Rc  govc
    Should Be True  ${rc} != 127

    Load Nimbus Testbed Env  testbed-information-%{BUILD_NUMBER}
    Set Environment Variable  TEST_VCSA_BUILD  7515524
    Set Environment Variable  OVA_IP_%{BUILD_NUMBER}  %{OVA_IP}
    Set Global Variable  ${TEST_VC_USERNAME}  %{TEST_USERNAME}
    Set Global Variable  ${TEST_VC_PASSWORD}  %{TEST_PASSWORD}

    Register VC CA Cert With Windows  ${TEST_VC_IP}

Prepare Protractor
    [Arguments]  ${VCSA_IP}  ${SELENIUM_GRID_IP}  ${BROWSER}
    # cache the original content of the protractor configuration file
    ${protractor_conf}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/protractor.conf.js
    Set Global Variable  ${original_protractor_conf}  ${protractor_conf}

    # point the protractor to use the provided selenium grid host
    ${sed_cmd}=  Catenate
    ...  sed -e "s|.*baseUrl.*|baseUrl: 'https:\/\/${VCSA_IP}\/ui',|"
    ...  -e "s|.*seleniumAddress.*|seleniumAddress: 'http:\/\/${SELENIUM_GRID_IP}:4444\/wd\/hub',|"
    ...  -e "s|.*directConnect.*|seleniumAddress: 'http:\/\/${SELENIUM_GRID_IP}:4444\/wd\/hub',|"
    ...  -e "s/'browserName.*/'browserName': '${BROWSER}',/"
    ...  h5c/vic/src/vic-webapp/protractor.conf.js > /tmp/protractor.conf.js
    ${before_sed}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/protractor.conf.js
    ${rc}  ${out}=  Run And Return Rc And Output  ${sed_cmd}
    Should Be Equal As Integers  ${rc}  0
    Run Keyword Unless  ${rc} == 0  Log  ${out}
    Run  cp /tmp/protractor.conf.js ./h5c/vic/src/vic-webapp/
    ${after_sed}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/protractor.conf.js
    Log  sed cmd: ${sed_cmd}
    Log  before sed: ${before_sed}
    Log  after sed: ${after_sed}

    # update loginPage.ts to set the correct baseUrl
    ${login_page_ts}=  OperatingSystem.Get File  h5c/vic/src/vic-webapp/e2e/pages/loginPage.ts
    Set Global Variable  ${original_login_page_ts}  ${login_page_ts}
    ${rc}  ${out}=  Run And Return Rc And Output  sed -e "s|.*return browser\.get\(.*|return browser\.get\('https:\/\/${VCSA_IP}\/ui'\);|" h5c/vic/src/vic-webapp/e2e/pages/loginPage.ts > /tmp/loginPage.ts
    Should Be Equal As Integers  ${rc}  0
    Run Keyword Unless  ${rc} == 0  Log  ${out}
    Run  cp /tmp/loginPage.ts ./h5c/vic/src/vic-webapp/e2e/pages

Reboot vSphere Client
    [Arguments]  ${VCSA_IP}
    # reboot vsphere client after installing the plugin
    Open Connection  ${VCSA_IP}  prompt=#
    Login  root  vmware
    Execute Command  service-control --stop vsphere-ui
    Execute Command  service-control --start vsphere-ui

    # wait until vsphere-ui service is up and running
    Wait Until Keyword Succeeds  20x  30s  Is vSphere Client Ready  ${VCSA_IP}
    Log To Console  vSphere Client has booted.
    Close connection

Is vSphere Client Ready
    [Arguments]  ${VCSA_IP}
    Log To Console  Waiting until vSphere Client is up and ready...
    ${out}=  Run  curl -sL https://${VCSA_IP}/ui/ -k
    ${out_len}=  Get Length  ${out}
    Should Be True  ${out_len} > 0
    Should Not Contain  ${out}  Service Unavailable
    Should Not Contain  ${out}  is still initializing

Cleanup Plugins From VC
    [Arguments]  ${VC_TARGET}  ${VCSA_FINGERPRINT}  ${VC_USERNAME}=administrator@vsphere.local  ${VC_PASSWORD}=Bl*ckwalnut0
    Close All Browsers
    Log To Console  Removing VIC UI plugins from ${VC_TARGET}...
    # remove plugins
    ${rc}  ${uname_v}=  Run And Return Rc And Output  uname -v
    ${is_darwin}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    ${vic-ui-binary}=  Set Variable If  ${is_darwin}  ./vic-ui-darwin  ./vic-ui-linux
    ${rc1}  ${out1}=  Run And Return Rc And Output  ${vic-ui-binary} remove --thumbprint ${VCSA_FINGERPRINT} --target ${VC_TARGET} --user ${VC_USERNAME} --password ${VC_PASSWORD} --key com.vmware.vic.ui
    ${rc2}  ${out2}=  Run And Return Rc And Output  ${vic-ui-binary} remove --thumbprint ${VCSA_FINGERPRINT} --target ${VC_TARGET} --user ${VC_USERNAME} --password ${VC_PASSWORD} --key com.vmware.vic
    Log To Console  ${out1}
    Log To Console  ${out2}

Destroy Dangling VCHs Created By Protractor
    [Arguments]  ${VC_TARGET}  ${VCSA_FINGERPRINT}  ${VC_USERNAME}=administrator@vsphere.local  ${VC_PASSWORD}=Bl*ckwalnut0
    Set Environment Variable  GOVC_URL  ${VC_TARGET}
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  ${VC_USERNAME}
    Set Environment Variable  GOVC_PASSWORD  ${VC_PASSWORD}

    ${rc}  ${uname_v}=  Run And Return Rc And Output  uname -v
    ${is_darwin}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    ${vic-machine-binary}=  Set Variable If  ${is_darwin}  ./ui-nightly-run-bin/vic-machine-darwin  ./ui-nightly-run-bin/vic-machine-linux

    # get a list of dangling VMs created by protractor
    ${rc}  ${out}=  Run And Return Rc And Output  govc vm.info -dc Datacenter -json true "virtual-container-host-*" | jq -r '.VirtualMachines[].Name'

    # if there are any dangling VCHs, delete them. if not, exit the keyword
    Run Keyword Unless  ${rc} == 0  Log To Console  VC inventory is clean. No need to clean up dangling VCHs
    Run Keyword Unless  ${rc} == 0  Return From Keyword
    @{vms}=  Split String  ${out}  \n
    :FOR  ${vm}  IN  @{vms}
    \  Log To Console  Destroying VCH: ${vm}
    \  ${rc}  ${out}=  Run And Return Rc And Output  ${vic-machine-binary} delete --name ${vm} --target ${VC_TARGET}/Datacenter --user ${VC_USERNAME} --password '${VC_PASSWORD}' --compute-resource Cluster --force --thumbprint ${VCSA_FINGERPRINT}
    \  Log To Console  ${out}
