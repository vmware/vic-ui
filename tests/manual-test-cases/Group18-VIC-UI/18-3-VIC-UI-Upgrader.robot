# Copyright 2017 VMware, Inc. All Rights Reserved.
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
Documentation   Test 18-3 - VIC UI Upgrade
Resource        ../../resources/Util.robot
Resource        ./vicui-common.robot
Test Teardown   Cleanup Installer Environment
Suite Setup     Load Testbed Information And Force Remove Vicui Plugin
Suite Teardown  Teardown Script Test Suite

*** Variables ***
${REMOTE_RESULTS_FOLDER}  /tmp/vic-ui-e2e-upgrader

*** Keywords ***
Load Testbed Information And Force Remove Vicui Plugin
    # load nimbus & vch testbed information from testbed-information
    Load Nimbus Testbed Env
    Force Remove Vicui Plugin
    Set Absolute Script Paths

*** Test Cases ***
TestCase-Attempt To Upgrade With Configs File Missing
    [Tags]  anyos
    # Rename the configs file and run the upgrader script to see if it fails in an expected way
    Move File  ${UI_INSTALLER_PATH}/configs  ${UI_INSTALLER_PATH}/configs_renamed
    Run Keyword And Continue On Failure  Script Fails For Missing Config Or Manifest  upgrade
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Configs file is missing
    Move File  ${UI_INSTALLER_PATH}/configs_renamed  ${UI_INSTALLER_PATH}/configs
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-configs-file-missing.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade With Plugin Manifest Missing
    [Tags]  anyos
    Move File  ${UI_INSTALLER_PATH}/../plugin-manifest  ${UI_INSTALLER_PATH}/../plugin-manifest-a
    Run Keyword And Continue On Failure  Script Fails For Missing Config Or Manifest  upgrade
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Plugin manifest was not found
    Move File  ${UI_INSTALLER_PATH}/../plugin-manifest-a  ${UI_INSTALLER_PATH}/../plugin-manifest
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-manifest-missing.log
    Should Be True  ${passed}

TestCase-Be Prompted to Enter VC IP
    [Tags]    unixlike
    Run Keyword And Continue On Failure  Interact With Script  upgrade  None  Enter FQDN or IP to target vCenter Server
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Enter FQDN or IP to target vCenter Server
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-be-prompted-to-fail-enter-vc-ip.log
    Should Be True  ${passed}

TestCase-Be Prompted to Enter VC IP
    [Tags]    windows
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -p pw  Enter FQDN or IP to target vCenter Server
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Enter FQDN or IP to target vCenter Server
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-be-prompted-to-fail-enter-vc-ip.log
    Should Be True  ${passed}

TestCase-Be Prompted to Enter VC Username
    [Tags]    unixlike
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP}  Enter your vCenter Administrator Username
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Enter your vCenter Administrator Username
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-be-prompted-to-enter-vc-username.log
    Should Be True  ${passed}

TestCase-Be Prompted to Enter VC Username
    [Tags]    windows
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -p pw  Enter your vCenter Administrator Username
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Enter your vCenter Administrator Username
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-be-prompted-to-enter-vc-username.log
    Should Be True  ${passed}

TestCase-Be Prompted to Enter VC Password
    [Tags]    unixlike
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME}  Enter your vCenter Administrator Password
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Enter your vCenter Administrator Password
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-be-prompted-to-enter-vc-password.log
    Should Be True  ${passed}

TestCase-Be Prompted to Verify VC Thumbprint
    [Tags]    anyos
    Remove Environment Variable  VIC_MACHINE_THUMBPRINT
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  Are you sure you trust the authenticity of this host
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  ${VC_FINGERPRINT}
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-be-prompted-to-verify-vc-thumbprint.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade With VIC_MACHINE_THUMBPRINT Env Var Set
    [Tags]    anyos
    Set Environment Variable  VIC_MACHINE_THUMBPRINT  ${VC_FINGERPRINT}
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  Are you sure you trust the authenticity of this host
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  ${VC_FINGERPRINT}
    Remove Environment Variable  VIC_MACHINE_THUMBPRINT
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-vic_machine_thumbprint-env-var-set.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade Against A Non vCenter Server
    [Tags]    unixlike
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  not-a-vcenter-server  admin  password
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  vCenter Server was not found
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-against-a-non-vcenter-server.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade Against A Non vCenter Server
    [Tags]    windows
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i not-a-vcenter-server -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  Error
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Error
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-against-a-non-vcenter-server.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade With Wrong Vcenter Credentials
    [Tags]    unixlike
    Set Fileserver And Thumbprint In Configs
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  ${TEST_VC_IP}  ${TEST_VC_USERNAME}_nope  ${TEST_VC_PASSWORD}_nope
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Cannot complete login due to an incorrect user name or password
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-wrong-vcenter-credentials.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade With Wrong Vcenter Credentials
    [Tags]    windows
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME}_nope -p ${TEST_VC_PASSWORD}_nope  ${EMPTY}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    # TODO: replace the following error message with "Cannot complete login due to an incorrect user name or password"
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Error
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-wrong-vcenter-credentials.log
    Should Be True  ${passed}

TestCase-Attempt to Upgrade With Unmatching VC Fingerprint
    [Tags]    unixlike
    Append To File  ${UI_INSTALLER_PATH}/configs  BYPASS_PLUGIN_VERIFICATION=1\n
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${FALSE}  ff:ff:ff
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  does not match
    Run Keyword Unless  ${passed}  Move File  upgrade.log  upgrade-fail-attempt-to-upgrade-with-unmatching-fingerprint.log
    Should Be True  ${passed}

TestCase-Attempt To Upgrade With Wrong OVA Fileserver URL
    [Tags]    unixlike
    Set Fileserver And Thumbprint In Configs  ${TRUE}
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Error
    Run Keyword Unless  ${passed}  Move File  install.log  upgrade-fail-attempt-to-upgrade-with-wrong-ova-fileserver-url.log
    Should Be True  ${passed}

TestCase-Upgrade When No Plugin Is Installed
    [Tags]    unixlike
    Set Fileserver And Thumbprint In Configs
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Do you want to install
    ${passed2}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Exited successfully
    Run Keyword Unless  ${passed} and ${passed2}  Move File  upgrade.log  upgrade-fail-upgrade-when-no-plugin-is-installed.log
    Should Be True  ${passed} and ${passed2}

TestCase-Upgrade When No Plugin Is Installed
    [Tags]    windows
    Remove Environment Variable  VIC_MACHINE_THUMBPRINT  target_vcenter_ip  vcenter_username  vcenter_password
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  ${EMPTY}  ${TRUE}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Do you want to install
    ${passed2}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Exited successfully
    Run Keyword Unless  ${passed} and ${passed2}  Move File  upgrade.log  upgrade-fail-upgrade-when-no-plugin-is-installed.log
    Should Be True  ${passed} and ${passed2}

TestCase-Upgrade When Plugins Are Already Installed
    [Tags]    unixlike
    Set Fileserver And Thumbprint In Configs
    Run Keyword And Continue On Failure  Interact With Upgrade Sh  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Are you sure you want to continue
    ${passed2}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Exited successfully
    Run Keyword Unless  ${passed} and ${passed2}  Move File  upgrade.log  upgrade-fail-upgrade-when-plugins-are-already-installed.log
    Should Be True  ${passed} and ${passed2}

TestCase-Upgrade When Plugins Are Already Installed
    [Tags]    windows
    Remove Environment Variable  VIC_MACHINE_THUMBPRINT  target_vcenter_ip  vcenter_username  vcenter_password
    Run Keyword And Continue On Failure  Interact With Script  upgrade  -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  ${EMPTY}  ${TRUE}  ${TRUE}
    ${output}=  OperatingSystem.GetFile  upgrade.log
    ${passed}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Are you sure you want to continue
    ${passed2}=  Run Keyword And Return Status  Should Match Regexp  ${output}  Exited successfully
    Run Keyword Unless  ${passed} and ${passed2}  Move File  upgrade.log  upgrade-fail-upgrade-when-plugins-are-already-installed.log
    Should Be True  ${passed} and ${passed2}

# Run the test cases above in macOS
Run Testcases On Mac
    ${results_folder}=  Set Variable  ../../../%{TEST_RESULTS_FOLDER}
    ${remote_vic_root}=  Set Variable  /Users/browseruser/Desktop/vic-ui
    ${remote_scratch_folder}=  Set Variable  /tmp/vic-ui-e2e-scratch
    OperatingSystem.Create Directory  ${results_folder}

    # log into macOS host and copy required files
    Open SSH Connection  ${MACOS_HOST_IP}  ${MACOS_HOST_USER}  ${MACOS_HOST_PASSWORD}
    Execute Command  mkdir -p ${remote_scratch_folder}
    Put File  testbed-information  ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/  mode=0700
    Put File  ../../../ui-nightly-run-bin/vic-ui-darwin  ${remote_vic_root}/
    ${rc}  ${output}=  Run And Return Rc And Output  sshpass -p "${MACOS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r ../../../scripts ${MACOS_HOST_USER}@${MACOS_HOST_IP}:${remote_scratch_folder} 2>&1
    Run Keyword Unless  ${rc} == 0  Log To Console  ${output}

    # update local repo
    ${update_repo_command}=  Catenate
    ...  mkdir -p ${REMOTE_RESULTS_FOLDER} &&
    ...  cd ${remote_vic_root} &&
    ...  git remote update &&
    ...  git checkout -f master &&
    ...  git rebase vmware/master
    ${stdout}  ${stderr}  ${rc}=  Execute Command  ${update_repo_command}  return_stderr=True  return_rc=True
    Run Keyword Unless  ${rc} == 0  Log To Console  ${stderr}

    # copy binaries
    ${stdout}  ${stderr}  ${rc}=  Execute Command  cp -rvf ${remote_scratch_folder}/scripts ${remote_vic_root}/  return_stderr=True  return_rc=True
    Run Keyword Unless  ${rc} == 0  Log To Console  ${stderr}
    Should Be Equal As Integers  ${rc}  0

    # remotely run robot test
    ${run_tests_command}=  Catenate
    ...  cd ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI 2>&1 &&
    ...  TEST_VCSA_BUILD=%{TEST_VCSA_BUILD} /usr/local/bin/robot -d ${REMOTE_RESULTS_FOLDER} --include anyos --include unixlike --test TestCase-* 18-3-VIC-UI-Upgrader.robot > ${REMOTE_RESULTS_FOLDER}/remote_stdouterr.log 2>&1
    ${stdout}  ${rc}=  Execute Command  ${run_tests_command}  return_rc=True

    # Store whether the run was successful
    ${remote_command_successful}=  Run Keyword And Return Status  Should Be Equal As Integers  ${rc}  0

    # download test results bundle to ../../../%{TEST_RESULTS_FOLDER} and close connection
    SSHLibrary.Get File  ${REMOTE_RESULTS_FOLDER}/*  ${results_folder}/
    SSHLibrary.Get File  ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/*.log  ${results_folder}/
    Execute Command  rm -rf ${REMOTE_RESULTS_FOLDER} ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/*.log 2>&1
    Close Connection

    OperatingSystem.File Should Exist  ${results_folder}/remote_stdouterr.log
    ${remote_stdouterr}=  OperatingSystem.Get File  ${results_folder}/remote_stdouterr.log
    Log To Console  ${remote_stdouterr}

    # report pass or fail
    Should Be True  ${remote_command_successful}

# Run the test cases above in Windows
Run Testcases On Windows
    ${results_folder}=  Set Variable  ../../../%{TEST_RESULTS_FOLDER}
    ${remote_vic_root}=  Set Variable  /cygdrive/c/Users/IEUser/vic-ui
    ${remote_scratch_folder}=  Set Variable  /tmp/vic-ui-e2e-scratch
    OperatingSystem.Create Directory  ${results_folder}

    # log into Windows host and copy required files
    Open SSH Connection  ${WINDOWS_HOST_IP}  ${WINDOWS_HOST_USER}  ${WINDOWS_HOST_PASSWORD}
    Execute Command  mkdir -p ${remote_scratch_folder}
    Put File  testbed-information  ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/
    Put File  ../../../scripts/plugin-manifest  ${remote_vic_root}/scripts/
    Put File  ../../../scripts/vCenterForWindows/configs-7312210  ${remote_vic_root}/scripts/vCenterForWindows/
    Put File  ../../../vic-ui-windows.exe  ${remote_vic_root}/
    ${rc}  ${output}=  Run And Return Rc And Output  sshpass -p "${WINDOWS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r ../../../scripts ${WINDOWS_HOST_USER}@${WINDOWS_HOST_IP}:${remote_scratch_folder} 2>&1
    Run Keyword Unless  ${rc} == 0  Log To Console  ${output}

    Execute Command  rm -rf ${REMOTE_RESULTS_FOLDER}
    Execute Command  mkdir -p ${REMOTE_RESULTS_FOLDER}

    # remotely run robot test
    ${ssh_command}=  Catenate
    ...  cd ${remote_vic_root} &&
    ...  git remote update &&
    ...  git checkout -f master &&
    ...  git rebase vmware/master &&
    ...  cd tests/manual-test-cases/Group18-VIC-UI &&
    ...  TEST_VCSA_BUILD=%{TEST_VCSA_BUILD} robot.bat -d ${REMOTE_RESULTS_FOLDER} --include anyos --include windows --test TestCase-* 18-3-VIC-UI-Upgrader.robot > ${REMOTE_RESULTS_FOLDER}/remote_stdouterr.log 2>&1
    ${stdout}  ${robotscript_rc}=  Execute Command  ${ssh_command}  return_rc=True

    # Store whether the run was successful, print out any error message
    ${did_all_tests_pass}=  Run Keyword And Return Status  Should Be Equal As Integers  ${robotscript_rc}  0
    Run Keyword Unless  ${did_all_tests_pass}  Log To Console  remote command exited with rc > 0: ${stdout}

    # download test results bundle to ../../../%{TEST_RESULTS_FOLDER} and close connection
    ${rc}  ${out}=  Run And Return Rc And Output  sshpass -p "${WINDOWS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r ${WINDOWS_HOST_USER}@${WINDOWS_HOST_IP}:${REMOTE_RESULTS_FOLDER}/* ${results_folder} 2>&1
    Run Keyword Unless  ${rc} == 0  Log  scp failed fetching robot test stdout/stderr log: ${out}  ERROR
    Should Be Equal As Integers  ${rc}  0
    ${rc}  ${out}=  Run And Return Rc And Output  sshpass -p "${WINDOWS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r ${WINDOWS_HOST_USER}@${WINDOWS_HOST_IP}:/cygdrive/c${REMOTE_RESULTS_FOLDER}/* ${results_folder} 2>&1
    Run Keyword Unless  ${rc} == 0  Log  scp failed fetching output.xml file: ${out}  ERROR
    Should Be Equal As Integers  ${rc}  0
    ${rc}  ${out}=  Run And Return Rc And Output  sshpass -p "${WINDOWS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r ${WINDOWS_HOST_USER}@${WINDOWS_HOST_IP}:${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/*.log ${results_folder} 2>&1
    Run Keyword Unless  ${rc} == 0  Log  scp failed fetching other log files: ${out}  ERROR
    Should Be Equal As Integers  ${rc}  0

    # remove logs on remote host and close the connection
    Execute Command  rm -rf ${REMOTE_RESULTS_FOLDER} ${remote_vic_root}/tests/manual-test-cases/Group18-VIC-UI/*.log
    Close Connection

    # fix permission issue for files fetched from the remote host
    Run  chmod -R 644 ${results_folder}/*

    OperatingSystem.File Should Exist  ${results_folder}/remote_stdouterr.log
    ${remote_stdouterr}=  OperatingSystem.Get File  ${results_folder}/remote_stdouterr.log
    Log To Console  ${remote_stdouterr}

    # report pass or fail
    Should Be True  ${did_all_tests_pass}
