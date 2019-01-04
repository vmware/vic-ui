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
Documentation    vSphere Integrated Containers UI Integration Tests Runner
Suite Setup      Prepare Testbed
Suite Teardown   Cleanup Testbed
Resource         ../../resources/Util.robot
Resource         ./vicui-common.robot

*** Variables ***
${TEST_SCRIPTS_ROOT}           tests/test-cases/Group18-VIC-UI/
${VICTEST2XL}                  ${TEST_SCRIPTS_ROOT}/victest2xl.py
${IS_NIGHTLY_TEST}             ${TRUE}
${BUILD_VER_ISSUE_WORKAROUND}  ${TRUE}
${ALL_TESTS_PASSED}            ${TRUE}

*** Keywords ***
Prepare Testbed
    ${ts}=  Get Current Date  result_format=epoch  exclude_millis=True
    Set Suite Variable  ${time_start}  ${ts}
    Cleanup Previous Test Logs
    Check Working Dir
    Check Drone
    Check Govc
    Setup Test Matrix

Check Working Dir
    ${wd}=  Run  pwd
    @{wd_split}=  Split String  ${wd}  /
    ${wd_level_len}=  Get Length  ${wd_split}
    ${last_level_idx}=  Evaluate  ${wd_level_len} - 1
    ${current_folder}=  Get From List  ${wd_split}  ${last_level_idx}
    Run Keyword Unless  '${current_folder}' == 'vic-ui'  Fatal Error  Test script should be run from vic-ui/

Check Drone
    ${rc}  ${drone_ver}=  Run And Return Rc And Output  drone --version 2>&1
    Log  Checking Drone version...
    Log  return code: ${rc}, output: ${drone_ver}  DEBUG
    Run Keyword If  ${rc} > ${0}  Fatal Error  Drone is required to run tests!

Check Govc
    ${rc}=  Run And Return Rc  govc
    Should Be True  ${rc} != 127

Cleanup Previous Test Logs
    Log  Removing UI test result directories if present...
    Run  rm -rf ui-test-results* 2>/dev/null

Prepare H5 Plugins For Testing
    Run Keyword Unless  ${IS_NIGHTLY_TEST}  Build H5 Plugins
    Run Keyword If  ${BUILD_VER_ISSUE_WORKAROUND} and not ${IS_NIGHTLY_TEST}  Sync Vic Ui Version With Vic Repo
    # scp plugin binaries to the test file server
    Run  sshpass -p "${MACOS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r scripts/vsphere-client-serenity/*.zip ${MACOS_HOST_USER}@${MACOS_HOST_IP}:~/Documents/vc-plugin-store/public/vsphere-plugins/files/
    Run  sshpass -p "${MACOS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r scripts/plugin-packages/*.zip ${MACOS_HOST_USER}@${MACOS_HOST_IP}:~/Documents/vc-plugin-store/public/vsphere-plugins/files/

Sync Vic Ui Version With Vic Repo
    ${rc}  ${out}=  Run And Return Rc And Output  ./scripts/sync-vic-ui-version.sh -p ui-nightly-run-bin/ 2>&1
    Run Keyword Unless  ${rc} == 0  Log To Console  Failed to sync vic-ui version!: ${out}
    Run  cp -rf ui-nightly-run-bin/ui/* scripts/

Build H5 Plugins
    # ensure build tools are accessible
    ${rc}=  Run And Return Rc  ant -version
    Should Be Equal As Integers  ${rc}  0
    ${rc}=  Run And Return Rc  npm --version
    Should Be Equal As Integers  ${rc}  0

    ${rc}  ${out}=  Run And Return Rc And Output  wget -nv ${GCP_DOWNLOAD_PATH}${SDK_PACKAGE_ARCHIVE} -O /tmp/${SDK_PACKAGE_ARCHIVE}
    Run Keyword Unless  ${rc} == 0  Fatal Error  wget error!: ${out}

	${rc}  ${out}=  Run And Return Rc And Output  tar -xzf /tmp/${SDK_PACKAGE_ARCHIVE} -C /tmp/
    Run Keyword Unless  ${rc} == 0  Fatal Error  tar error!: ${out}

    Log To Console  Building H5 Client plugin...
    ${rc}  ${out}=  Run And Return Rc And Output  ant -f h5c/build-deployable.xml -Denv.VSPHERE_SDK_HOME=${ENV_VSPHERE_SDK_HOME} -Denv.VSPHERE_H5C_SDK_HOME=${ENV_HTML_SDK_HOME} -Denv.BUILD_MODE=prod 2>&1
    Run Keyword Unless  ${rc} == 0  Fatal Error  Failed to build H5 Client plugin! ${out}
    Log To Console  Successfully built H5 Client plugin.\n

Setup Test Matrix
    # skip matrix
    @{skip_test_config_matrix}=  Create List
    # There's currently a version clash between the Selenium standalone binary and HSUIA project
    Append To List  ${skip_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows,Firefox,Firefox
    # There's a H5C bug in IE11 that appears only when automatically tested
    Append To List  ${skip_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows,IExplorer,IE11
    Set Global Variable  ${SKIP_TEST_MATRIX}  ${skip_test_config_matrix}

    # installer test matrix
    @{installer_test_config_matrix}=  Create List
    &{installer_test_results_dict}=  Create Dictionary
    Append To List  ${installer_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Ubuntu
    Append To List  ${installer_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Mac
    Append To List  ${installer_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows
    Set Global Variable  ${INSTALLER_TEST_MATRIX}        ${installer_test_config_matrix}
    Set Global Variable  ${INSTALLER_TEST_RESULTS_DICT}  ${installer_test_results_dict}

    # uninstaller test matrix
    @{uninstaller_test_config_matrix}=  Create List
    &{uninstaller_test_results_dict}=  Create Dictionary
    Append To List  ${uninstaller_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Ubuntu
    Append To List  ${uninstaller_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Mac
    Append To List  ${uninstaller_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows
    Set Global Variable  ${UNINSTALLER_TEST_MATRIX}        ${uninstaller_test_config_matrix}
    Set Global Variable  ${UNINSTALLER_TEST_RESULTS_DICT}  ${uninstaller_test_results_dict}

    # upgrader test matrix
    @{upgrader_test_config_matrix}=  Create List
    &{upgrader_test_results_dict}=  Create Dictionary
    Append To List  ${upgrader_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Ubuntu
    Append To List  ${upgrader_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Mac
    Append To List  ${upgrader_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows
    Set Global Variable  ${UPGRADER_TEST_MATRIX}        ${upgrader_test_config_matrix}
    Set Global Variable  ${UPGRADER_TEST_RESULTS_DICT}  ${upgrader_test_results_dict}

    # plugin test matrix
    @{plugin_test_config_matrix}=  Create List
    &{plugin_test_results_dict}=  Create Dictionary
    # vSphere H5C is not supported  on Linux
    # https://docs.vmware.com/en/VMware-vSphere/6.5/com.vmware.vsphere.upgrade.doc/GUID-F6D456D7-C559-439D-8F34-4FCF533B7B42.html
    Append To List  ${plugin_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Mac,Chrome,Chrome
    Append To List  ${plugin_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Mac,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows,Chrome,Chrome
    Append To List  ${plugin_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  %{VC_VER_NO},%{ESX_BUILD_NO},%{VC_BUILD_NO},Windows,IExplorer,IE11
    Set Global Variable  ${PLUGIN_TEST_MATRIX}        ${plugin_test_config_matrix}
    Set Global Variable  ${PLUGIN_TEST_RESULTS_DICT}  ${plugin_test_results_dict}

Get Testbed Information
    Set Environment Variable  GOVC_INSECURE  1
    ${file}=  Evaluate  'testbed-information-%{BUILD_NUMBER}'
    Load Nimbus Testbed Env  ${file}
    # Log To Console  Testbed setup is in progress. See setup-testbed.log for detailed logs.
    # ${results}=  Run Process  bash  -c  robot --exclude presetup -C ansi tests/test-cases/Group18-VIC-UI/setup-testbed.robot > tests/test-cases/Group18-VIC-UI/setup-testbed.log 2>&1
    # Run Keyword If  ${results.rc} == 0  Log To Console  Testbed setup done
    # ${testbed-setup-log}=  OperatingSystem.Get File  tests/test-cases/Group18-VIC-UI/setup-testbed.log
    # Run Keyword Unless  ${results.rc} == 0  Fatal Error  Failed to fetch testbed information! See error below:\n${testbed-setup-log}
    # Load Nimbus Testbed Env

Get Integration Container Id
    ${rc}  ${out}=  Run And Return Rc And Output  docker ps --filter status=running --filter ancestor=gcr.io/eminent-nation-87317/vic-integration-test:1.33 -l --format={{.ID}}
    ${status}  ${val}=  Run Keyword And Ignore Error  Should Not Be Empty  ${out}
    Run Keyword Unless  '${status}' == 'PASS'  Log To Console  Container is not yet ready. Waiting...
    Should Be True  '${status}' == 'PASS'
    [Return]  ${out}

Run Script Test With Config
    [Arguments]  ${run_config}  ${title}  ${test_name}  ${results_dict}
    # an example of ${title} is 'Installer test'
    # an example of ${test_name} is '18-1-VIC-UI-Installer'
    @{config}=      Split String   ${run_config}  ,
    ${vc_version}=  Get From List  ${config}  0
    ${esx_build}=   Get From List  ${config}  1
    ${vc_build}=    Get From List  ${config}  2
    ${os}=          Get From List  ${config}  3
    Set Environment Variable  TEST_VSPHERE_VER  ${vc_version}
    Set Environment Variable  TEST_ESX_BUILD  ${esx_build}
    Set Environment Variable  TEST_VCSA_BUILD  ${vc_build}
    Set Environment Variable  TEST_OS  ${os}
    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  ${title},${run_config}

    # prepare yml file
    ${dict_key}=  Set Variable  VC${vc_version}-${esx_build}-${vc_build}-${os}
    ${test_results_folder}=  Set Variable  ui-test-results/${test_name}-${dict_key}
    ${sed-replace-command}=  Catenate
    ...  sed -e "s/\#TEST_VSPHERE_VER/${vc_version}/g"
    ...  -e "s|#BUILD_NUMBER|%{BUILD_NUMBER}|g"
    ...  -e "s|\#TEST_VCSA_BUILD|${vc_build}|g"
    ...  -e "s|\#TEST_OS|${os}|g"
    ...  -e "s|\#TEST_RESULTS_FOLDER|${test_results_folder}|g"
    ...  -e "s|\#ROBOT_SCRIPT|${test_name}\.robot|g" > .drone.local.tests.yml

    Log To Console  ${\n}........................................
    Log To Console     ${title}
    Log To Console  ........................................
    Log To Console  vSphere version: ${vc_version}
    Log To Console  ESX build: ${esx_build}
    Log To Console  VCSA build: ${vc_build}
    Log To Console  Operating System: ${os}
    Run Keyword If  ${is_skipped}  Log To Console  Skipped...
    Run Keyword If  ${is_skipped}  Set To Dictionary  ${results_dict}  ${dict_key}  \[ SKIPPED \]\t${title} / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os}
    Return From Keyword If  ${is_skipped}
    Get Testbed Information
    Set Environment Variable  VCH-NAME  %{VCH_VM_NAME}
    Log To Console  ........................................

    # generate .drone.local.tests.yml
    Run  cat .drone.local.script.yml | ${sed-replace-command}
    OperatingSystem.File Should Exist  .drone.local.tests.yml

    ${rc}=  Run And Return Rc  mkdir -p ${test_results_folder}
    Should Be Equal As Integers  ${rc}  0

    # run drone
    ${drone-exec-string}=  Set Variable  drone exec --timeout \"1h0m0s\" --timeout.inactivity \"1h0m0s\" --repo.trusted .drone.local.tests.yml
    ${pid}=  Start Process  bash  -c  ${drone-exec-string}  stdout=${test_results_folder}/stdout.log  stderr=STDOUT
    ${docker-ps}=  Wait Until Keyword Succeeds  30x  5s  Get Integration Container Id
    Log To Console  Drone worker \@ ${docker-ps}
    ${results}=  Wait For Process  ${pid}

    # set pass/fail based on return code
    Run Keyword Unless  ${results.rc} == 0  Set Global Variable  ${ALL_TESTS_PASSED}  ${FALSE}
    ${pf}=  Run Keyword If  ${results.rc} == 0  Set Variable  \[ PASS \]\t${title} / ESX build ${esx_build} / VC build ${vc_build} / ${os}  ELSE  Set Variable  \[ FAIL \]\t${title} / ESX build ${esx_build} / VC build ${vc_build} / ${os}
    Set To Dictionary  ${results_dict}  ${test_name}-${dict_key}  ${pf}

    Log To Console  ${results.rc}
    Log To Console  ${results.stdout}
    Log To Console  ${results.stderr}

    # move log files
    Move Files  tests/test-cases/Group18-VIC-UI/*.log  ${test_results_folder}/

Run Plugin Test With Config
    [Arguments]  ${run_config}
    @{config}=                       Split String   ${run_config}  ,
    ${vc_version}=                   Get From List  ${config}  0
    ${esx_build}=                    Get From List  ${config}  1
    ${vc_build}=                     Get From List  ${config}  2
    ${os}=                           Get From List  ${config}  3
    ${selenium_browser}=             Get From List  ${config}  4
    ${selenium_browser_normalized}=  Get From List  ${config}  5
    Set Environment Variable  TEST_VSPHERE_VER  ${vc_version}
    Set Environment Variable  TEST_ESX_BUILD  ${esx_build}
    Set Environment Variable  TEST_VCSA_BUILD  ${vc_build}
    Set Environment Variable  TEST_OS  ${os}
    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  ${run_config}

    # prepare yml file
    ${dict_key}=  Set Variable  VC${vc_version}-${esx_build}-${vc_build}-${os}-${selenium_browser_normalized}
    ${test_results_folder}=  Set Variable  ui-test-results/18-4-VIC-UI-Plugin-tests-${dict_key}
    ${sed-replace-command}=  Catenate
    ...  sed -e "s/\#TEST_VSPHERE_VER/${vc_version}/g"
    ...  -e "s|\#TEST_VCSA_BUILD|${vc_build}|g"
    ...  -e "s|\#TEST_OS|${os}|g"
    ...  -e "s|\#SELENIUM_BROWSER|${selenium_browser}|g"
    ...  -e "s|\#BROWSER_NORMALIZED_NAME|${selenium_browser_normalized}|g"
    ...  -e "s|\#TEST_RESULTS_FOLDER|${test_results_folder}|g" > .drone.local.tests.yml

    Log To Console  ${\n}........................................
    Log To Console     vSphere Client Plugin test - Portlets
    Log To Console  ........................................
    Log To Console  vSphere version: ${vc_version}
    Log To Console  ESX build: ${esx_build}
    Log To Console  VCSA build: ${vc_build}
    Log To Console  Operating System: ${os}
    Log To Console  Browser: ${selenium_browser}
    Run Keyword If  ${is_skipped}  Log To Console  Skipped...
    Run Keyword If  ${is_skipped}  Set To Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${dict_key}  \[ SKIPPED \]\tH5 Client plugin test - Portlets / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os} / ${selenium_browser_normalized}
    Return From Keyword If  ${is_skipped}
    Get Testbed Information
    Set Environment Variable  VCH-NAME  %{VCH_VM_NAME}
    Log To Console  ........................................

    # generate .drone.local.tests.yml
    Run  cat .drone.local.plugin.yml | ${sed-replace-command}
    OperatingSystem.File Should Exist  .drone.local.tests.yml

    ${rc}=  Run And Return Rc  mkdir -p ${test_results_folder}
    Should Be Equal As Integers  ${rc}  0
    Set To Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${dict_key}  \[ FAILED \]\tH5 Client plugin test - Portlets / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os} / ${selenium_browser_normalized}

    # run drone
    ${drone-exec-string}=  Set Variable  drone exec --timeout \"1h0m0s\" --timeout.inactivity \"1h0m0s\" --repo.trusted .drone.local.tests.yml
    ${pid}=  Start Process  bash  -c  ${drone-exec-string}  stdout=${test_results_folder}/stdout.log  stderr=STDOUT
    ${docker-ps}=  Wait Until Keyword Succeeds  30x  5s  Get Integration Container Id
    Log To Console  Drone worker \@ ${docker-ps}
    ${results}=  Wait For Process  ${pid}

    # set pass/fail based on return code
    Run Keyword Unless  ${results.rc} == 0  Set Global Variable  ${ALL_TESTS_PASSED}  ${FALSE}
    ${pf}=  Run Keyword If  ${results.rc} == 0  Set Variable  \[ PASSED \]  ELSE  Set Variable  \[ FAILED \]
    ${pf_string}=  Set Variable  ${pf}\tH5 Client plugin - Portlets / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os} / ${selenium_browser_normalized}
    Set To Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${dict_key}  ${pf_string}

    Log To Console  ${results.rc}
    Log To Console  ${results.stdout}
    Log To Console  ${results.stderr}

    # move log files
    Move Files  tests/test-cases/Group18-VIC-UI/*.log  ${test_results_folder}/

Generate Excel Report
    ${script_exists}  ${out}=  Run Keyword And Ignore Error  OperatingSystem.File Should Exist  ${VICTEST2XL}
    ${run_results}=  Run Keyword If  '${script_exists}' == 'PASS'  Run  bash -c "${script_exists} -searchdir ./ui-test-results/ -f output.xml 2>&1 && cp log.xlsx ui-test-results/"
    Run Keyword Unless  '${script_exists}' == 'PASS'  Log  ${VICTEST2XL} was not found. Skipping...  WARN
    ${rc}  ${out}=  Run And Return Rc And Output  ./${VICTEST2XL} -searchdir ./ui-test-results/ -f output.xml 2>&1
    Run Keyword Unless  ${rc} == 0  Log  There was an error generating log.xlsx!: ${out}  ERROR
    Run  cp log.xlsx ui-test-results/

Cleanup Testbed
    Terminate All Processes  kill=True

    # Delete all transient and sensitive information
    Run  rm -rf .drone.local.tests.yml testbed-information /tmp/sdk/ >/dev/null 2>&1
    Run  rm -rf Kickoff-Tests* VCH-0*

    # Revert some modified local files
    Run  git reset --hard HEAD

    # Delete binaries
    Run  rm -rf vicui-test-report-*.zip
    Run  rm -rf tests/test-cases/Group18-VIC-UI/*VCH-0*
    Run  rm -rf scripts/plugin-packages/com.vmware.vic-v1*
    Run  rm -rf scripts/vsphere-client-serenity/com.vmware.vic.ui-v1*

Generate Report
    ${results_dir_exists}=  Run Keyword And Return Status  OperatingSystem.Directory Should Exist  ui-test-results
    Touch  ui-test-results.log

    # go through each folder and extract results
    @{cases}=  OperatingSystem.List Directories In Directory  ui-test-results
    ${keys_installer}=  Get Dictionary Keys  ${INSTALLER_TEST_RESULTS_DICT}
    ${keys_uninstaller}=  Get Dictionary Keys  ${UNINSTALLER_TEST_RESULTS_DICT}
    ${keys_upgrader}=  Get Dictionary Keys  ${UPGRADER_TEST_RESULTS_DICT}

    Append To File  ui-test-results.log  ** Installer script **\n
    :FOR  ${case}  IN  @{keys_installer}
    \    ${pf}=  Get From Dictionary  ${INSTALLER_TEST_RESULTS_DICT}  ${case}
    \    Append To File  ui-test-results.log  ${pf}\n

    Append To File  ui-test-results.log  \n** Uninstaller script **\n
    :FOR  ${case}  IN  @{keys_uninstaller}
    \    ${pf}=  Get From Dictionary  ${UNINSTALLER_TEST_RESULTS_DICT}  ${case}
    \    Append To File  ui-test-results.log  ${pf}\n

    Append To File  ui-test-results.log  \n** Upgrader script **\n
    :FOR  ${case}  IN  @{keys_upgrader}
    \    ${pf}=  Get From Dictionary  ${UPGRADER_TEST_RESULTS_DICT}  ${case}
    \    Append To File  ui-test-results.log  ${pf}\n

*** Test Cases ***
Launch Installer Tests
    :FOR  ${config}  IN  @{INSTALLER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Installer Test  18-1-VIC-UI-Installer  ${INSTALLER_TEST_RESULTS_DICT}
    \    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  Installer Test,${config}

Launch Uninstaller Tests
    :FOR  ${config}  IN  @{UNINSTALLER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Uninstaller Test  18-2-VIC-UI-Uninstaller  ${UNINSTALLER_TEST_RESULTS_DICT}
    \    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  Uninstaller Test,${config}

Launch Upgrader Tests
    :FOR  ${config}  IN  @{UPGRADER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Upgrader Test  18-3-VIC-UI-Upgrader  ${UPGRADER_TEST_RESULTS_DICT}
    \    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  Upgrader Test,${config}

Cleanup VCH
    Uninstall VCH

# All H5 Client plugin tests are now migrated to Protractor
# Launch Plugin Tests
#     :FOR  ${config}  IN  @{PLUGIN_TEST_MATRIX}
#     \    Run Plugin Test With Config  ${config}
#     \    ${is_skipped}=  Run Keyword And Return Status  List Should Contain Value  ${SKIP_TEST_MATRIX}  ${config}
#     \    Run Keyword Unless  ${is_skipped}  Uninstall VCH  ${TRUE}

Report Results
    # TODO: revisit later
    # Run Keyword If  ${IS_NIGHTLY_TEST}  Generate Excel Report
    Generate Report
    Run Keyword Unless  ${ALL_TESTS_PASSED}  Log To Console  At least one test failed!
    Should Be True  ${ALL_TESTS_PASSED}
