# Copyright 2016-2017 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#	http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License

*** Settings ***
Documentation  Common keywords used by VIC UI installation & uninstallation test suites
Resource  ../../resources/Util.robot
Library  VicUiInstallPexpectLibrary.py

*** Variables ***
${MACOS_HOST_IP}                      10.20.121.192
${UBUNTU_HOST_IP}                     10.20.121.145
${WINDOWS_HOST_IP}                    10.25.200.225
${SECRETS_FILE}                       test.secrets
${vic_macmini_fileserver_url}         https://10.20.121.192:3443/vsphere-plugins/
${vic_macmini_fileserver_thumbprint}  BE:64:39:8B:BD:98:47:4D:E8:3B:2F:20:A5:21:8B:86:5F:AD:79:CE

*** Keywords ***
Set Fileserver And Thumbprint In Configs
    [Arguments]  ${fake}=${FALSE}
    ${fileserver_url}=  Run Keyword If  ${fake} == ${TRUE}  Set Variable  256.256.256.256  ELSE  Set Variable  ${vic_macmini_fileserver_url}
    ${fileserver_thumbprint}=  Run Keyword If  ${fake} == ${TRUE}  Set Variable  ab:cd:ef  ELSE  Set Variable  ${vic_macmini_fileserver_thumbprint}
    ${results}=  Replace String Using Regexp  ${configs}  VIC_UI_HOST_URL=.*  VIC_UI_HOST_URL=\"${fileserver_url}\"
    ${results}=  Replace String Using Regexp  ${results}  VIC_UI_HOST_THUMBPRINT=.*  VIC_UI_HOST_THUMBPRINT=\"${fileserver_thumbprint}\"
    Create File  ${UI_INSTALLER_PATH}/configs  ${results}

Load Nimbus Testbed Env
    Should Exist  testbed-information
    ${envs}=  OperatingSystem.Get File  testbed-information
    @{envs}=  Split To Lines  ${envs}
    :FOR  ${item}  IN  @{envs}
    \  @{kv}=  Split String  ${item}  =
    \  Set Environment Variable  @{kv}[0]  @{kv}[1]
    \  Set Suite Variable  \$@{kv}[0]  @{kv}[1]
    Set Suite Variable  ${TEST_VC_USERNAME}  %{TEST_USERNAME}
    Set Suite Variable  ${TEST_VC_PASSWORD}  %{TEST_PASSWORD}

Load Secrets
    [Arguments]  ${secrets}=${SECRETS_FILE}
    OperatingSystem.File Should Exist  ${secrets}
    ${envs}=  OperatingSystem.Get File  ${secrets}
    @{envs}=  Split To Lines  ${envs}
    :FOR  ${item}  IN  @{envs}
    \  @{kv}=  Split String  ${item}  =
    \  ${stripped}=  Replace String  @{kv}[1]  "  ${EMPTY}
    \  Set Environment Variable  @{kv}[0]  ${stripped}
    \  Set Suite Variable  \$@{kv}[0]  @{kv}[1]

Install VIC Appliance For VIC UI
    [Arguments]  ${vic-machine}=ui-nightly-run-bin/vic-machine-linux  ${appliance-iso}=ui-nightly-run-bin/appliance.iso  ${bootstrap-iso}=ui-nightly-run-bin/bootstrap.iso  ${certs}=${true}  ${vol}=default
    Set Test Environment Variables
    # disable firewall
    Run Keyword If  '%{HOST_TYPE}' == 'ESXi'  Run  govc host.esxcli network firewall set -e false
    # Attempt to cleanup old/canceled tests
    Run Keyword And Ignore Error  Cleanup Dangling VMs On VIC UI Test Server  ${vic-machine}
    Run Keyword And Ignore Error  Cleanup Datastore On Test Server
    Run Keyword And Ignore Error  Cleanup Dangling Networks On Test Server
    Run Keyword And Ignore Error  Cleanup Dangling vSwitches On Test Server

    # Install the VCH now
    Log To Console  \nInstalling VCH to test server...
    ${output}=  Run VIC Machine Command  ${vic-machine}  ${appliance-iso}  ${bootstrap-iso}  ${certs}  ${vol}  1  ${EMPTY}
    Log  ${output}
    Should Contain  ${output}  Installer completed successfully
    Get Docker Params  ${output}  ${certs}
    Set Environment Variable  VIC-ADMIN  %{VCH-IP}:2378
    Log To Console  Installer completed successfully: %{VCH-NAME}...

Cleanup Dangling VMs On VIC UI Test Server
    [Arguments]  ${vic-machine-binary}=ui-nightly-run-bin/vic-machine-linux
    ${out}=  Run  govc ls vm
    ${vms}=  Split To Lines  ${out}
    :FOR  ${vm}  IN  @{vms}
    \   ${vm}=  Fetch From Right  ${vm}  /
    \   ${build}=  Split String  ${vm}  -
    \   # Skip any VM that is not associated with integration tests
    \   Continue For Loop If  '@{build}[0]' != 'VCH'
    \   # Skip any VM that is still running
    \   ${state}=  Get State Of Drone Build  @{build}[1]
    \   Continue For Loop If  '${state}' == 'running'
    \   ${uuid}=  Run  govc vm.info -json\=true ${vm} | jq -r '.VirtualMachines[0].Config.Uuid'
    \   Log To Console  Destroying dangling VCH: ${vm}
    \   ${rc}  ${output}=  Delete VIC Machine  ${vm}  ${vic-machine-binary}

Set Absolute Script Paths
    ${rc}  ${out}=  Run And Return Rc And Output  ver
    ${is_windows}=  Run Keyword And Return Status  Should Contain  ${out}  Windows
    ${UI_INSTALLERS_ROOT}=  Set Variable  ../../../ui/installer
    Run Keyword If  ${is_windows}  Set Suite Variable  ${UI_INSTALLER_PATH}  ${UI_INSTALLERS_ROOT}/vCenterForWindows  ELSE  Set Suite Variable  ${UI_INSTALLER_PATH}  ${UI_INSTALLERS_ROOT}/VCSA
    Should Exist  ${UI_INSTALLER_PATH}
    ${configs_content}=  OperatingSystem.GetFile  ${UI_INSTALLER_PATH}/configs
    Set Suite Variable  ${configs}  ${configs_content}
    Run Keyword If  %{TEST_VSPHERE_VER} == 65  Set Suite Variable  ${plugin_folder}  plugin-packages  ELSE  Set Suite Variable  ${plugin_folder}  vsphere-client-serenity

    # set exact paths for installer and uninstaller scripts
    Set Script Filename  INSTALLER_SCRIPT_PATH  ./install
    Set Script Filename  UNINSTALLER_SCRIPT_PATH  ./uninstall

Set Script Filename
    [Arguments]    ${suite_varname}  ${script_name}
    ${SCRIPT_FILENAME}=  Set Variable  ${script_name}.sh
    ${SCRIPT_FILENAME}=  Join Path  ${UI_INSTALLER_PATH}  ${SCRIPT_FILENAME}
    Set Suite Variable  \$${suite_varname}  ${SCRIPT_FILENAME}

Reset Configs
    # Revert the configs file back to what it was
    ${results}=  Replace String Using Regexp  ${configs}  VIC_UI_HOST_URL=.*  VIC_UI_HOST_URL=\"\"
    ${results}=  Replace String Using Regexp  ${results}  VIC_UI_HOST_THUMBPRINT=.*  VIC_UI_HOST_THUMBPRINT=\"\"
    Create File  ${UI_INSTALLER_PATH}/configs  ${results}
    Should Exist  ${UI_INSTALLER_PATH}/configs

Force Install Vicui Plugin
    ${rc}  ${ver}=  Run And Return Rc And Output  ver
    ${is_windows}=  Run Keyword And Return Status  Should Contain  ${ver}  Windows
    ${vic-ui-binary}=  Run Keyword If  ${is_windows}  Set Variable  ..\\..\\..\\vic-ui-windows  ELSE  Set Variable  ../../../vic-ui-linux
    Set Fileserver And Thumbprint In Configs
    Run Keyword Unless  ${is_windows}  Append To File  ${UI_INSTALLER_PATH}/configs  BYPASS_PLUGIN_VERIFICATION=1\n
    Run Keyword If  ${is_windows}  Interact With Script  install  -f -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  ${EMPTY}  True  ELSE  Install Plugin Successfully  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${TRUE}  None  ${TRUE}
    Run Keyword Unless  ${is_windows}  Reset Configs
    ${output}=  OperatingSystem.GetFile  install.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  exited successfully
    Run Keyword Unless  ${passed}  Move File  install.log  fail-force-install-vicui-plugin.log
    Should Be True  ${passed}

Force Remove Vicui Plugin
    ${rc}  ${ver}=  Run And Return Rc And Output  ver
    ${is_windows}=  Run Keyword And Return Status  Should Contain  ${ver}  Windows
    ${vic-ui-binary}=  Run Keyword If  ${is_windows}  Set Variable  ..\\..\\..\\vic-ui-windows  ELSE  Set Variable  ../../../vic-ui-linux
    ${rc}  ${output}=  Run And Return Rc And Output  ${vic-ui-binary} remove --thumbprint %{VC_FINGERPRINT} --target ${TEST_VC_IP} --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --key com.vmware.vic.ui
    ${rc}  ${output}=  Run And Return Rc And Output  ${vic-ui-binary} remove --thumbprint %{VC_FINGERPRINT} --target ${TEST_VC_IP} --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --key com.vmware.vic

Rename Folder
    [Arguments]  ${old}  ${new}
    Move Directory  ${old}  ${new}
    Should Exist  ${new}

Cleanup Installer Environment
    # Reverts the configs file and make sure the folder containing the UI binaries has its original name that might've been left modified due to a test failure
    Reset Configs
    ${configs_dangling}=  Run Keyword And Return Status  OperatingSystem.File Should Exist  ${UI_INSTALLER_PATH}/configs_renamed
    ${plugin_manifest_dangling}=  Run Keyword And Return Status  OperatingSystem.File Should Exist  ${UI_INSTALLER_PATH}/../plugin-manifest-a

    Run Keyword If  ${configs_dangling}  Move File  ${UI_INSTALLER_PATH}/configs_renamed  ${UI_INSTALLER_PATH}/configs
    Run Keyword If  ${plugin_manifest_dangling}  Move File  ${UI_INSTALLER_PATH}/../plugin-manifest-a  ${UI_INSTALLER_PATH}/../plugin-manifest

Delete VIC Machine
    [Tags]  secret
    [Arguments]  ${vch-name}  ${vic-machine}=ui-nightly-run-bin/vic-machine-linux
    ${rc}  ${output}=  Run And Return Rc And Output  ${vic-machine} delete --name=${vch-name} --target=%{TEST_URL}%{TEST_DATACENTER} --user=%{TEST_USERNAME} --password=%{TEST_PASSWORD} --force=true --compute-resource=%{TEST_RESOURCE} --timeout %{TEST_TIMEOUT}
    [Return]  ${rc}  ${output}

Uninstall VCH
    [Arguments]  ${remove_plugin}=${FALSE}
    Log To Console  Gathering logs from the test server...
    Gather Logs From Test Server
    Log To Console  Deleting the VCH appliance...
    ${uname_v}=  Run  uname -v
    ${is_macos}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    ${vic-machine-binary}=  Run Keyword If  ${is_macos}  Set Variable  vic-machine-darwin  ELSE  Set Variable  vic-machine-linux
    ${rc}  ${output}=  Delete VIC Machine  %{VCH_VM_NAME}  ui-nightly-run-bin/${vic-machine-binary}
    Check Delete Success  %{VCH_VM_NAME}
    Should Be Equal As Integers  ${rc}  0
    Should Contain  ${output}  Completed successfully
    ${output}=  Run  rm -f %{VCH_VM_NAME}-*.pem
    ${out}=  Run Keyword If  '%{HOST_TYPE}' == 'ESXi'  Run  govc host.portgroup.remove %{VCH_VM_NAME}-bridge
    Run Keyword If  ${remove_plugin} == ${TRUE}  Force Remove Vicui Plugin

Teardown Script Test Suite
    Close All Connections

    # in case configs file remains renamed but not reverted let's rename it here
    ${configs_renamed_exists}=  Run Keyword And Return Status  OperatingSystem.File Should Exist  ${UI_INSTALLER_PATH}/configs_renamed
    Run Keyword If  ${configs_renamed_exists}  Move File  ${UI_INSTALLER_PATH}/configs_renamed  ${UI_INSTALLER_PATH}/configs

    # in case plugin-manifest file remains renamed but not reverted let's rename it here
    ${manifest_a_exists}=  Run Keyword And Return Status  OperatingSystem.File Should Exist  ${UI_INSTALLER_PATH}/../plugin-manifest-a
    Run Keyword If  ${manifest_a_exists}  Move File  ${UI_INSTALLER_PATH}/../plugin-manifest-a  ${UI_INSTALLER_PATH}/../plugin-manifest

    # remove other temp files and artifacts
    ${rc}  ${uname_v}=  Run And Return Rc And Output  uname -v
    ${is_windows}=  Run Keyword And Return Status  Should Be True  ${rc} > 0
    ${is_mac}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    Run Keyword If  not ${is_windows} and ${is_mac}  Cleanup MacOS Testbed
    Run Keyword If  ${is_windows}  Cleanup Windows Testbed

Cleanup MacOS Testbed
    ${files_to_remove}=  Catenate
    ...  /Users/jkim/Desktop/vic/tests/manual-test-cases/Group18-VIC-UI/testbed-information
    ...  /Users/jkim/Desktop/vic/tests/manual-test-cases/Group18-VIC-UI/VCH-0*
    ...  /Users/jkim/Desktop/vic/tests/manual-test-cases/Group18-VIC-UI/18-*.zip
    ...  /Users/jkim/Desktop/vic/test.secrets
    ...  /tmp/vic-ui-e2e-scratch

    ${output}=  Run  rm -rvf ${files_to_remove} 2>&1
    Log  Cleaning up macOS testbed...\n${output}

Cleanup Windows Testbed
    ${files_to_remove}=  Catenate
    ...  ~/vic/tests/manual-test-cases/Group18-VIC-UI/testbed-information
    ...  ~/vic/tests/manual-test-cases/Group18-VIC-UI/VCH-0*
    ...  ~/vic/tests/manual-test-cases/Group18-VIC-UI/18-*.zip
    ...  ~/vic/test.secrets
    ...  /tmp/vic-ui-e2e-scratch

    ${output}=  Run  rm -rf ${files_to_remove} 2>&1
    Log  Cleaning up Windows testbed...\n${output}
