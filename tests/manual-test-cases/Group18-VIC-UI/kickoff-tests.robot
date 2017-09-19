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
${TEST_SCRIPTS_ROOT}     tests/manual-test-cases/Group18-VIC-UI/
${VICTEST2XL}            ${TEST_SCRIPTS_ROOT}/victest2xl.py
${IS_NIGHTLY_TEST}       ${TRUE}

*** Keywords ***
Prepare Testbed
    ${ts}=  Get Current Date  result_format=epoch  exclude_millis=True
    Set Suite Variable  ${time_start}  ${ts}
    Cleanup Previous Test Logs
    Check Working Dir
    Check Drone
    Load Secrets
    Get Latest Vic Engine Binary
    Setup Test Matrix

Check Working Dir
    ${wd}=  Run  pwd
    @{wd_split}=  Split String  ${wd}  /
    ${wd_level_len}=  Get Length  ${wd_split}
    ${last_level_idx}=  Evaluate  ${wd_level_len} - 1
    ${current_folder}=  Get From List  ${wd_split}  ${last_level_idx}
    Run Keyword Unless  '${current_folder}' == 'vic'  Fatal Error  Test script should be run from vic/

Check Drone
    ${rc}  ${drone_ver}=  Run And Return Rc And Output  drone --version 2>&1
    Log  Checking Drone version...
    Log  return code: ${rc}, output: ${drone_ver}  DEBUG
    Run Keyword If  ${rc} > ${0}  Fatal Error  Drone is required to run tests!
    Run Keyword If  '0.5.0' not in '${drone_ver}'  Fatal Error  Drone 0.5.0 is required to run tests!

Cleanup Previous Test Logs
    Log  Removing UI test result directories if present...
    Run  rm -rf ui-test-results 2>/dev/null
    Run  for f in $(find flex/vic-uia/ -name "\$*") ; do rm $f ; done

Download VIC Engine Tarball
    [Arguments]  ${url}  ${filename}
    Log  Downloading ${url}...
    ${rc}=  Run And Return Rc  wget ${url} -O ${filename}
    Should Be Equal As Integers  ${rc}  0
    OperatingSystem.File Should Exist  ${filename}
    [Return]  ${rc} == 0

Prepare VIC Engine Binaries
    Log  Extracting binary files...
    ${rc1}=  Run And Return Rc  mkdir -p ui-nightly-run-bin
    ${rc2}=  Run And Return Rc  tar xvzf ${LATEST_VIC_ENGINE_TARBALL} -C ui-nightly-run-bin --strip 1
    Should Be Equal As Integers  ${rc1}  0
    Should Be Equal As Integers  ${rc2}  0
    # copy vic-ui-linux and plugin binaries to where test scripts will access them
    Run  cp -rf ui-nightly-run-bin/vic-ui-* ./
    Prepare Flex And H5 Plugins For Testing

Prepare Flex And H5 Plugins For Testing
    Run Keyword If  ${IS_NIGHTLY_TEST}  Run  cp -rf ui-nightly-run-bin/ui/* scripts/  ELSE  Build Flex And H5 Plugins
    # scp plugin binaries to the test file server. note that ssh authentication is done through publickey
    Run  sshpass -p "${MACOS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r scripts/vsphere-client-serenity/*.zip ${MACOS_HOST_USER}@${MACOS_HOST_IP}:~/Documents/vc-plugin-store/public/vsphere-plugins/files/
    Run  sshpass -p "${MACOS_HOST_PASSWORD}" scp -o StrictHostKeyChecking\=no -r scripts/plugin-packages/*.zip ${MACOS_HOST_USER}@${MACOS_HOST_IP}:~/Documents/vc-plugin-store/public/vsphere-plugins/files/

Build Flex And H5 Plugins
    # ensure build tools are accessible
    ${rc}=  Run And Return Rc  ant -version
    Should Be Equal As Integers  ${rc}  0
    ${rc}=  Run And Return Rc  npm --version
    Should Be Equal As Integers  ${rc}  0

    ${rc}  ${out}=  Run And Return Rc And Output  wget -nv ${GCP_DOWNLOAD_PATH}${SDK_PACKAGE_ARCHIVE} -O /tmp/${SDK_PACKAGE_ARCHIVE}
    Run Keyword Unless  ${rc} == 0  Fatal Error  wget error!: ${out}

	${rc}  ${out}=  Run And Return Rc And Output  tar -xzf /tmp/${SDK_PACKAGE_ARCHIVE} -C /tmp/
    Run Keyword Unless  ${rc} == 0  Fatal Error  tar error!: ${out}

    Log To Console  Building Flex Client plugin...
    ${rc}  ${out}=  Run And Return Rc And Output  ant -f flex/vic-ui/build-deployable.xml -Denv.VSPHERE_SDK_HOME=${ENV_VSPHERE_SDK_HOME} -Denv.FLEX_HOME=${ENV_FLEX_SDK_HOME} 2>&1
    Run Keyword Unless  ${rc} == 0  Fatal Error  Failed to build Flex Client plugin! ${out}
    Log To Console  Successfully built Flex Client plugin.\n

    Log To Console  Building H5 Client plugin...
    ${rc}  ${out}=  Run And Return Rc And Output  ant -f h5c/build-deployable.xml -Denv.VSPHERE_SDK_HOME=${ENV_VSPHERE_SDK_HOME} -Denv.FLEX_HOME=${ENV_FLEX_SDK_HOME} -Denv.VSPHERE_H5C_SDK_HOME=${ENV_HTML_SDK_HOME} -Denv.BUILD_MODE=prod 2>&1
    Run Keyword Unless  ${rc} == 0  Fatal Error  Failed to build H5 Client plugin! ${out}
    Log To Console  Successfully built H5 Client plugin.\n

Get Latest Vic Engine Binary
    Log  Fetching the latest VIC Engine tar ball...
    ${input}=  Run  gsutil ls -l gs://vic-engine-builds/vic_* | grep -v TOTAL | sort -k2 -r | head -n1 | xargs | cut -d ' ' -f 3 | cut -d '/' -f 4
    Set Suite Variable  ${buildNumber}  ${input}
    Set Suite Variable  ${LATEST_VIC_ENGINE_TARBALL}  ${input}
    ${results}=  Wait Until Keyword Succeeds  5x  15 sec  Download VIC Engine Tarball  https://storage.googleapis.com/vic-engine-builds/${input}  ${LATEST_VIC_ENGINE_TARBALL}
    Should Be True  ${results}
    Prepare VIC Engine Binaries

Setup Test Matrix
    # installer test matrix
    @{installer_test_config_matrix}=  Create List
    &{installer_test_results_dict}=  Create Dictionary
    Append To List  ${installer_test_config_matrix}  60,3620759,3634791,Ubuntu
    Append To List  ${installer_test_config_matrix}  65,5310538,5318154,Ubuntu
    Append To List  ${installer_test_config_matrix}  60,3620759,3634791,Mac
    Append To List  ${installer_test_config_matrix}  65,5310538,5318154,Mac
    Append To List  ${installer_test_config_matrix}  60,3620759,3634791,Windows
    Append To List  ${installer_test_config_matrix}  65,5310538,5318154,Windows
    Set Global Variable  ${INSTALLER_TEST_MATRIX}        ${installer_test_config_matrix}
    Set Global Variable  ${INSTALLER_TEST_RESULTS_DICT}  ${installer_test_results_dict}

    # uninstaller test matrix
    @{uninstaller_test_config_matrix}=  Create List
    &{uninstaller_test_results_dict}=  Create Dictionary
    Append To List  ${uninstaller_test_config_matrix}  60,3620759,3634791,Ubuntu
    Append To List  ${uninstaller_test_config_matrix}  65,5310538,5318154,Ubuntu
    Append To List  ${uninstaller_test_config_matrix}  60,3620759,3634791,Mac
    Append To List  ${uninstaller_test_config_matrix}  65,5310538,5318154,Mac
    Append To List  ${uninstaller_test_config_matrix}  60,3620759,3634791,Windows
    Append To List  ${uninstaller_test_config_matrix}  65,5310538,5318154,Windows
    Set Global Variable  ${UNINSTALLER_TEST_MATRIX}        ${uninstaller_test_config_matrix}
    Set Global Variable  ${UNINSTALLER_TEST_RESULTS_DICT}  ${uninstaller_test_results_dict}

    # upgrader test matrix
    @{upgrader_test_config_matrix}=  Create List
    &{upgrader_test_results_dict}=  Create Dictionary
    Append To List  ${upgrader_test_config_matrix}  60,3620759,3634791,Ubuntu
    Append To List  ${upgrader_test_config_matrix}  65,5310538,5318154,Ubuntu
    Append To List  ${upgrader_test_config_matrix}  60,3620759,3634791,Mac
    Append To List  ${upgrader_test_config_matrix}  65,5310538,5318154,Mac
    Append To List  ${upgrader_test_config_matrix}  60,3620759,3634791,Windows
    Append To List  ${upgrader_test_config_matrix}  65,5310538,5318154,Windows
    Set Global Variable  ${UPGRADER_TEST_MATRIX}        ${upgrader_test_config_matrix}
    Set Global Variable  ${UPGRADER_TEST_RESULTS_DICT}  ${upgrader_test_results_dict}

    # plugin test matrix
    @{plugin_test_config_matrix}=  Create List
    &{plugin_test_results_dict}=  Create Dictionary
    # vSphere H5C and Flex Client are not supported  on Linux
    # https://docs.vmware.com/en/VMware-vSphere/6.0/com.vmware.vsphere.install.doc/GUID-F6D456D7-C559-439D-8F34-4FCF533B7B42.html
    # https://docs.vmware.com/en/VMware-vSphere/6.5/com.vmware.vsphere.upgrade.doc/GUID-F6D456D7-C559-439D-8F34-4FCF533B7B42.html
    Append To List  ${plugin_test_config_matrix}  60,3620759,3634791,Mac,Googlechrome,Chrome
    Append To List  ${plugin_test_config_matrix}  60,3620759,3634791,Mac,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  60,3620759,3634791,Windows,Googlechrome,Chrome
    Append To List  ${plugin_test_config_matrix}  60,3620759,3634791,Windows,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  60,3620759,3634791,Windows,iexplore,IE11
    Append To List  ${plugin_test_config_matrix}  65,5310538,5318154,Mac,Chrome,Chrome
    Append To List  ${plugin_test_config_matrix}  65,5310538,5318154,Mac,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  65,5310538,5318154,Windows,Chrome,Chrome
    Append To List  ${plugin_test_config_matrix}  65,5310538,5318154,Windows,Firefox,Firefox
    Append To List  ${plugin_test_config_matrix}  65,5310538,5318154,Windows,IExplorer,IE11
    Set Global Variable  ${PLUGIN_TEST_MATRIX}        ${plugin_test_config_matrix}
    Set Global Variable  ${PLUGIN_TEST_RESULTS_DICT}  ${plugin_test_results_dict}

Get Testbed Information
    Set Environment Variable  GOVC_INSECURE  1
    Log To Console  Testbed setup is in progress. See setup-testbed.log for detailed logs.
    ${results}=  Run Process  bash  -c  robot --exclude presetup -C ansi tests/manual-test-cases/Group18-VIC-UI/setup-testbed.robot > tests/manual-test-cases/Group18-VIC-UI/setup-testbed.log 2>&1
    Run Keyword If  ${results.rc} == 0  Log To Console  Testbed setup done
    Run Keyword Unless  ${results.rc} == 0  Fatal Error  Failed to fetch testbed information! See error below:\n${results.stderr}
    Load Nimbus Testbed Env
    Move File  testbed-information  tests/manual-test-cases/Group18-VIC-UI/testbed-information

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
    @{config}=      Split String   ${run_config}  ,
    ${vc_version}=  Get From List  ${config}  0
    ${esx_build}=   Get From List  ${config}  1
    ${vc_build}=    Get From List  ${config}  2
    ${os}=          Get From List  ${config}  3
    Set Environment Variable  TEST_VSPHERE_VER  ${vc_version}
    Set Environment Variable  TEST_OS  ${os}

    Log To Console  ${\n}........................................
    Log To Console     ${title}
    Log To Console  ........................................
    Log To Console  vSphere version: ${vc_version}
    Log To Console  ESX build: ${esx_build}
    Log To Console  VCSA build: ${vc_build}
    Log To Console  Operating System: ${os}
    Log To Console  ........................................

    Get Testbed Information
    Set Environment Variable  VCH-NAME  %{VCH_VM_NAME}

    # prepare yml file
    ${dict_key}=  Set Variable  VC${vc_version}-${esx_build}-${vc_build}-${os}
    ${test_results_folder}=  Set Variable  ui-test-results/${test_name}-${dict_key}
    ${sed-replace-command}=  Catenate
    ...  sed -e "s/\#TEST_VSPHERE_VER/${vc_version}/g"
    ...  -e "s|\#TEST_OS|${os}|g"
    ...  -e "s|\#TEST_RESULTS_FOLDER|${test_results_folder}|g"
    ...  -e "s|\#ROBOT_SCRIPT|${test_name}\.robot|g" > .drone.local.tests.yml

    # generate .drone.local.tests.yml
    Run  cat .drone.local.script.yml | ${sed-replace-command}
    OperatingSystem.File Should Exist  .drone.local.tests.yml

    ${rc}=  Run And Return Rc  mkdir -p ${test_results_folder}
    Should Be Equal As Integers  ${rc}  0

    # run drone
    ${drone-exec-string}=  Set Variable  drone exec --timeout \"1h0m0s\" --timeout.inactivity \"1h0m0s\" --repo.trusted --secrets-file \"test.secrets\" .drone.local.tests.yml
    ${pid}=  Start Process  bash  -c  ${drone-exec-string}  stdout=${test_results_folder}/stdout.log  stderr=STDOUT
    ${docker-ps}=  Wait Until Keyword Succeeds  30x  5s  Get Integration Container Id
    Log To Console  Drone worker \@ ${docker-ps}
    ${results}=  Wait For Process  ${pid}

    # set pass/fail based on return code
    ${pf}=  Run Keyword If  ${results.rc} == 0  Set Variable  ⭕️   ELSE  Set Variable  ❌ 
    ${pf_string}=  Set Variable  ${pf} ${title} / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os}
    Set To Dictionary  ${results_dict}  ${dict_key}  ${pf_string}

    Log To Console  ${results.rc}
    Log To Console  ${results.stdout}
    Log To Console  ${results.stderr}

    # move log files
    Move Files  tests/manual-test-cases/Group18-VIC-UI/*.log  ${test_results_folder}/

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
    Set Environment Variable  TEST_OS  ${os}

    Log To Console  ${\n}........................................
    Log To Console     Plugin Test
    Log To Console  ........................................
    Log To Console  vSphere version: ${vc_version}
    Log To Console  ESX build: ${esx_build}
    Log To Console  VCSA build: ${vc_build}
    Log To Console  Operating System: ${os}
    Log To Console  Browser: ${selenium_browser}
    Log To Console  ........................................

    Get Testbed Information
    Set Environment Variable  VCH-NAME  %{VCH_VM_NAME}

    # prepare yml file
    ${dict_key}=  Set Variable  VC${vc_version}-${esx_build}-${vc_build}-${os}-${selenium_browser_normalized}
    ${test_results_folder}=  Set Variable  ui-test-results/18-4-VIC-UI-Plugin-tests-${dict_key}
    ${sed-replace-command}=  Catenate
    ...  sed -e "s/\#TEST_VSPHERE_VER/${vc_version}/g"
    ...  -e "s|\#TEST_OS|${os}|g"
    ...  -e "s|\#SELENIUM_BROWSER|${selenium_browser}|g"
    ...  -e "s|\#BROWSER_NORMALIZED_NAME|${selenium_browser_normalized}|g"
    ...  -e "s|\#TEST_RESULTS_FOLDER|${test_results_folder}|g" > .drone.local.tests.yml

    # generate .drone.local.tests.yml
    Run  cat .drone.local.plugin.yml | ${sed-replace-command}
    OperatingSystem.File Should Exist  .drone.local.tests.yml

    ${rc}=  Run And Return Rc  mkdir -p ${test_results_folder}
    Should Be Equal As Integers  ${rc}  0
    Set To Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${dict_key}  ❌ Plugin test / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os} / ${selenium_browser_normalized}

    # run drone
    ${drone-exec-string}=  Set Variable  drone exec --timeout \"1h0m0s\" --timeout.inactivity \"1h0m0s\" --repo.trusted --secrets-file \"test.secrets\" .drone.local.tests.yml
    ${pid}=  Start Process  bash  -c  ${drone-exec-string}  stdout=${test_results_folder}/stdout.log  stderr=STDOUT
    ${docker-ps}=  Wait Until Keyword Succeeds  30x  5s  Get Integration Container Id
    Log To Console  Drone worker \@ ${docker-ps}
    ${results}=  Wait For Process  ${pid}

    # set pass/fail based on return code
    ${pf}=  Run Keyword If  ${results.rc} == 0  Set Variable  ⭕️   ELSE  Set Variable  ❌ 
    ${pf_string}=  Set Variable  ${pf} Plugin test / VC${vc_version} / ESX build ${esx_build} / VC build ${vc_build} / ${os} / ${selenium_browser_normalized}
    Set To Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${dict_key}  ${pf_string}

    Log To Console  ${results.rc}
    Log To Console  ${results.stdout}
    Log To Console  ${results.stderr}

    # move log files
    Move Files  tests/manual-test-cases/Group18-VIC-UI/*.log  ${test_results_folder}/

Generate Test Report
    ${script_exists}  ${out}=  Run Keyword And Ignore Error  OperatingSystem.File Should Exist  ${VICTEST2XL}
    ${run_results}=  Run Keyword If  '${script_exists}' == 'PASS'  Run  bash -c "${script_exists} -searchdir ./ui-test-results/ -f output.xml 2>&1 && cp log.xlsx ui-test-results/"
    Run Keyword Unless  '${script_exists}' == 'PASS'  Log  ${VICTEST2XL} was not found. Skipping...  WARN
    ${rc}  ${out}=  Run And Return Rc And Output  ./${VICTEST2XL} -searchdir ./ui-test-results/ -f output.xml 2>&1
    Run Keyword Unless  ${rc} == 0  Log  There was an error generating log.xlsx!: ${out}  ERROR
    Run  cp log.xlsx ui-test-results/

Cleanup Testbed
    Terminate All Processes  kill=True

    # Delete all transient and sensitive information
    Run  rm -rf .drone.local.tests.yml testbed-information tests/manual-test-cases/Group18-VIC-UI/testbed-information /tmp/sdk/ >/dev/null 2>&1
    Run  rm -rf ui-test-results >/dev/null 2>&1
    Run  rm -rf Kickoff-Tests* VCH-0*

    # Revert some modified local files
    Run  git reset --hard HEAD

    # Delete binaries
    Run  rm -rf vicui-test-report-*.zip
    Run  rm -rf ${LATEST_VIC_ENGINE_TARBALL} ui-nightly-run-bin
    Run  rm -rf tests/manual-test-cases/Group18-VIC-UI/*VCH-0*
    Run  rm -rf scripts/plugin-packages/com.vmware.vic-v1*
    Run  rm -rf scripts/vsphere-client-serenity/com.vmware.vic.ui-v1*

Send Email
    ${boundary}=  Set Variable  zz_/afg6432dfgkl.94531qdffe121
    ${time_end}=  Get Current Date  result_format=epoch  exclude_millis=True
    ${elapsed_time}=  Evaluate  ${time_end} - ${time_start}
    # zip results
    ${now}=  Run  date +%m%d%y
    ${zip_filename}=  Set Variable  vicui-test-report-${now}.zip
    ${rc1}=  Run And Return Rc  zip -9 -r ${zip_filename} ui-test-results/
    Should Be Equal As Integers  ${rc1}  0
    ${rc2}  ${testresults_base64}=  Run And Return Rc And Output  base64 "${zip_filename}"
    Should Be Equal As Integers  ${rc2}  0

    ${head_commit}=  Run  git log -1 --pretty=format:%h
    ${email_title}=  Run Keyword If  ${IS_NIGHTLY_TEST}  Set Variable  vic ui nightly run ${buildNumber}  ELSE  Set Variable  vic integration test run ${head_commit}
    ${whoami}=  Run  whoami
    ${nightly_recipients}=  Catenate  SEPARATOR=\n
    ...    To: kjosh@vmware.com
    ...    To: joshuak@vmware.com
    ...    To: cfalcone@vmware.com
    ...    To: kmacdonell@vmware.com
    ...    To: mwilliamson@vmware.com
    ...    To: singhshweta@vmware.com
    ${email_to}=  Run Keyword If  ${IS_NIGHTLY_TEST}  Set Variable  ${nightly_recipients}  ELSE  Set Variable  To: ${whoami}@vmware.com
    ${email_body}=  Catenate  SEPARATOR=\n
    ...    ${email_to}
    ...    Subject: ${email_title}
    ...    From: Josh Kim <kjosh@vmware.com>
    ...    MIME-Version: 1.0
    ...    Content-Type: multipart/mixed; boundary="${boundary}"${\n}
    ...    --${boundary}
    ...    Content-Type: text/plain; charset="utf-8"
    ...    Content-Disposition: inline${\n}
    ...    hello, this is an auto-generated vic ui test report. please see the attachment to find out more details.
    ...    elapsed time: ${elapsed_time} seconds
    ...    ${SPACE}${\n}
    ...    --- tests run ---${\n}${\n}

    Create File  email_body.txt  ${email_body}
    @{installer_result_keys}=  Get Dictionary Keys    ${INSTALLER_TEST_RESULTS_DICT}
    @{uninstaller_result_keys}=  Get Dictionary Keys  ${UNINSTALLER_TEST_RESULTS_DICT}
    @{upgrader_result_keys}=  Get Dictionary Keys     ${UPGRADER_TEST_RESULTS_DICT}
    @{plugin_result_keys}=  Get Dictionary Keys       ${PLUGIN_TEST_RESULTS_DICT}

    :FOR  ${key}  IN  @{installer_result_keys}
    \    ${remarks}=  Get From Dictionary  ${INSTALLER_TEST_RESULTS_DICT}  ${key}
    \    Append To File  email_body.txt  ${remarks}${\n}

    :FOR  ${key}  IN  @{uninstaller_result_keys}
    \    ${remarks}=  Get From Dictionary  ${UNINSTALLER_TEST_RESULTS_DICT}  ${key}
    \    Append To File  email_body.txt  ${remarks}${\n}

    :FOR  ${key}  IN  @{upgrader_result_keys}
    \    ${remarks}=  Get From Dictionary  ${UPGRADER_TEST_RESULTS_DICT}  ${key}
    \    Append To File  email_body.txt  ${remarks}${\n}

    :FOR  ${key}  IN  @{plugin_result_keys}
    \    ${remarks}=  Get From Dictionary  ${PLUGIN_TEST_RESULTS_DICT}  ${key}
    \    Append To File  email_body.txt  ${remarks}${\n}

    ${installer_notes_str}=  Run  cat ${TEST_SCRIPTS_ROOT}/18-1-VIC-UI-Installer.robot | grep "# NOTE" | sed -e "s/^[[:space:]]*//g"
    ${uninstaller_notes_str}=  Run  cat ${TEST_SCRIPTS_ROOT}/18-2-VIC-UI-Uninstaller.robot | grep "# NOTE" | sed -e "s/^[[:space:]]*//g"
    ${upgrader_notes_str}=  Run  cat ${TEST_SCRIPTS_ROOT}/18-3-VIC-UI-Upgrader.robot | grep "# NOTE" | sed -e "s/^[[:space:]]*//g"

    @{installer_notes}=  Split String  ${installer_notes_str}  ${\n}
    @{uninstaller_notes}=  Split String  ${uninstaller_notes_str}  ${\n}
    @{upgrader_notes}=  Split String  ${upgrader_notes_str}  ${\n}

    ${installer_notes_len}=  Get Length  ${installer_notes}
    ${uninstaller_notes_len}=  Get Length  ${uninstaller_notes}
    ${upgrader_notes_len}=  Get Length  ${upgrader_notes}

    Run Keyword If  ${installer_notes_len} > 0  Append To File  email_body.txt  \n**Installer Test Notes**${\n}
    :FOR  ${line}  IN  @{installer_notes}
    \    ${bulletpointified}=  Replace String Using Regexp  ${line}  \#\\sNOTE\:  -
    \    Append To File  email_body.txt  ${bulletpointified}${\n}

    Run Keyword If  ${uninstaller_notes_len} > 0  Append To File  email_body.txt  \n**Uninstaller Test Notes**${\n}
    :FOR  ${line}  IN  @{uninstaller_notes}
    \    ${bulletpointified}=  Replace String Using Regexp  ${line}  \#\\sNOTE\:  -
    \    Append To File  email_body.txt  ${bulletpointified}${\n}

    Run Keyword If  ${upgrader_notes_len} > 0  Append To File  email_body.txt  \n**Upgrader Test Notes**${\n}
    :FOR  ${line}  IN  @{upgrader_notes}
    \    ${bulletpointified}=  Replace String Using Regexp  ${line}  \#\\sNOTE\:  -
    \    Append To File  email_body.txt  ${bulletpointified}${\n}

    ${email_zip_section}=  Catenate  SEPARATOR=\n
    ...    ${\n}--${boundary}
    ...    Content-Type: application/zip
    ...    Content-Transfer-Encoding: base64
    ...    Content-Disposition: attachment; filename="${zip_filename}"
    ...    ${\n}${testresults_base64}${\n}
    ...    --${boundary}--

    Append To File  email_body.txt  ${email_zip_section}
    Log To Console  Emailing run report...
    ${rc}=  Run And Return Rc  /usr/sbin/sendmail -t < email_body.txt
    Should Be Equal As Integers  ${rc}  0

*** Test Cases ***
Launch Installer Tests
    :FOR  ${config}  IN  @{INSTALLER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Installer Test  18-1-VIC-UI-Installer  ${INSTALLER_TEST_RESULTS_DICT}
    \    Uninstall VCH  ${TRUE}

Launch Uninstaller Tests
    :FOR  ${config}  IN  @{UNINSTALLER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Uninstaller Test  18-2-VIC-UI-Uninstaller  ${UNINSTALLER_TEST_RESULTS_DICT}
    \    Uninstall VCH  ${TRUE}

Launch Upgrader Tests
    :FOR  ${config}  IN  @{UPGRADER_TEST_MATRIX}
    \    Run Script Test With Config  ${config}  Upgrader Test  18-3-VIC-UI-Upgrader  ${UPGRADER_TEST_RESULTS_DICT}
    \    Uninstall VCH  ${TRUE}

Launch Plugin Tests
    :FOR  ${config}  IN  @{PLUGIN_TEST_MATRIX}
    \    Run Plugin Test With Config  ${config}
    \    Uninstall VCH  ${TRUE}

Report Results
    Run Keyword If  ${IS_NIGHTLY_TEST}  Generate Test Report
    Send Email
