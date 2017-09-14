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
Documentation  Test 18-4 - VIC UI Plugin tests
Resource  ../../resources/Util.robot
Resource  ./vicui-common.robot
Test Teardown  Clean Up Testbed Config Files
Suite Setup  Load Testbed Information And Force Install Vicui Plugin

*** Keywords ***
Load Testbed Information And Force Install Vicui Plugin
    Load Nimbus Testbed Env
    Load Secrets  ../../../test.secrets
    Set Absolute Script Paths
    Force Install Vicui Plugin

*** Variables ***
${HSUIA_TESTS}                   hsuia-tests-for-4849304
${HSUIA_TESTS_ZIP_URL}           https://storage.googleapis.com/vic-engine-builds/${HSUIA_TESTS}.zip
${HSUIA_TESTS_EXTRACT_LOCATION}  /tmp/${HSUIA_TESTS}
${SUITA_TESTS}                   suita-tests-for-3624791
${SUITA_TESTS_ZIP_URL}           https://storage.googleapis.com/vic-engine-builds/${SUITA_TESTS}.zip
${SUITA_TESTS_EXTRACT_LOCATION}  /tmp/${SUITA_TESTS}
${VICUIA_H5C_LOCATION}           ../../../h5c/vic-uia
${VICUIA_H5C_BUILDFILE}          ${VICUIA_H5C_LOCATION}/build-java.xml
${VICUIA_FLEX_LOCATION}          ../../../flex/vic-uia
${VICUIA_FLEX_BUILDFILE}         ${VICUIA_FLEX_LOCATION}/pom.xml
${VICUIA_JAR}                    vic-uia.jar
${TESTBED_PREPARATION_SCRIPT}    ../../../h5c/vic-uia/prepare-testbed.sh

*** Test Cases ***
Check Prerequisites
    Set Suite Variable  ${VCH_VM_NAME}  %{VCH_VM_NAME}
    ${pwd}=  Run  pwd
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Should Exist  ${pwd}/${VICUIA_FLEX_LOCATION}
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Set Suite Variable  ${NGC_TESTS_PATH}  ${pwd}/${VICUIA_FLEX_LOCATION}
    Set Suite Variable  ${use_existing_container_vm}  False
    Log To Console  Checking if Selenium Grid is reachable at %{SELENIUM_SERVER_IP}...
    ${ping_rc}=  Run And Return Rc  nc -zv %{SELENIUM_SERVER_IP} 4444 -w 3
    Run Keyword If  ${ping_rc} > 0  Fatal Error  Seleinum Grid %{SELENIUM_SERVER_IP} is not reachable!

    # check if the files required by the ngc automation tests exist
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Should Exist  ${NGC_TESTS_PATH}/resources/browservm.tpl.properties
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Should Exist  ${NGC_TESTS_PATH}/resources/commonTestbedProvider.tpl.properties
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Should Exist  ${NGC_TESTS_PATH}/resources/hostProvider.tpl.properties
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Should Exist  ${NGC_TESTS_PATH}/resources/vicEnvProvider.tpl.properties

Ensure Vicui Is Installed
    # ensure vicui is installed before running ngc automation tests
    Force Install Vicui Plugin
    Cleanup Installer Environment
    Reboot vSphere Client

Start Tests Project
    # create a container and get its name-id which is essentially the name of the vm
    Create And Run Test Container
    Log To Console  Using container ${CONTAINER_VM_TRUNCATED_NAME}\n

    # given the information in vicui-common.robot edit the above properties files
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Set Up Testbed For NGCTESTS  ELSE  Set Up Testbed For HSUIA
    Launch Plugin Tests

*** Keywords ***
Is vSphere Client Ready
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Log To Console  Waiting until vSphere Web Client is up and ready...  ELSE  Log To Console  Waiting until vSphere Client is up and ready...
    ${out}=  Run Keyword If  %{TEST_VSPHERE_VER} == 60  Run  curl -sL https://${TEST_VC_IP}/vsphere-client/ -k  ELSE  Run  curl -sL https://${TEST_VC_IP}/ui/ -k
    ${out_len}=  Get Length  ${out}
    Should Be True  ${out_len} > 0
    Should Not Contain  ${out}  Service Unavailable
    Should Not Contain  ${out}  is still initializing

Reboot vSphere Client
    # reboot vsphere (web) client after installing the plugin
    Open Connection  ${TEST_VC_IP}  prompt=#
    Login  root  vmware
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Execute Command  service vsphere-client stop  ELSE  Execute Command  service-control --stop vsphere-ui
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Execute Command  service vsphere-client start  ELSE  Execute Command  service-control --start vsphere-ui

    # wait until vsphere-client/ui server is up and running
    Wait Until Keyword Succeeds  20x  30s  Is vSphere Client Ready
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Log To Console  vSphere Web Client has booted.  ELSE  Log To Console  vSphere Client has booted.
    Close connection

Set Up Testbed For HSUIA
    Download And Unzip HSUIA
    Build Vicui HSUIA Project
    ${testbed-prep-args-65}=  Catenate
    ...  VC_IP=%{TEST_VC_IP}
    ...  VC_ADMIN_USERNAME=Administrator
    ...  VC_ADMIN_DOMAIN=vsphere.local
    ...  VC_ADMIN_PW=%{TEST_PASSWORD}
    ...  HOST_IP=%{ESX_HOST_IP}
    ...  HOST_DATASTORE_NAME=%{TEST_DATASTORE}
    ...  H5C_IP=%{TEST_VC_IP}
    ...  H5C_PORT=443
    ...  SELENIUM_IP=%{SELENIUM_SERVER_IP}
    ...  SELENIUM_PORT=4444
    ...  BROWSER=%{SELENIUM_BROWSER}
    ...  VCH_NAME=%{VCH_VM_NAME}
    ...  VCH_IP=%{VCH-IP}
    ...  CONTAINER_NAME=${CONTAINER_VM_TRUNCATED_NAME}
    ${rc}  ${out}=  Run And Return Rc And Output  bash -c "${testbed-prep-args-65} ${TESTBED_PREPARATION_SCRIPT} ${HSUIA_TESTS_EXTRACT_LOCATION}"
    Log To Console  testbed provision result ::: ${rc} ${out}

Set Up Testbed For NGCTESTS
    Download And Unzip SUITA
    # set up common testbed provider, host provider and vicenvprovider configurations here according to the content of vicui-common.robot
    ${browservm}=  OperatingSystem.GetFile  ${NGC_TESTS_PATH}/resources/browservm.tpl.properties
    ${commontestbed}=  OperatingSystem.GetFile  ${NGC_TESTS_PATH}/resources/commonTestbedProvider.tpl.properties
    ${host}=  OperatingSystem.GetFile  ${NGC_TESTS_PATH}/resources/hostProvider.tpl.properties
    ${vicenv}=  OperatingSystem.GetFile  ${NGC_TESTS_PATH}/resources/vicEnvProvider.tpl.properties

    # make original copies
    Set Suite Variable  ${browservm_original}  ${browser_vm}
    Set Suite Variable  ${commontestbed_original}  ${commontestbed}
    Set Suite Variable  ${host_original}  ${host}
    Set Suite Variable  ${vicenv_original}  ${vicenv}

    # populate browservm props
    ${browservm}=  Replace String Using Regexp  ${browservm}  (?<!\#)testbed\.seleniumServer=.*  testbed\.seleniumServer=${SELENIUM_SERVER_IP}
    ${browservm}=  Replace String Using Regexp  ${browservm}  (?<!\#)testbed\.seleniumServerPort=.*  testbed\.seleniumServerPort=${SELENIUM_SERVER_PORT}
    ${browservm}=  Replace String Using Regexp  ${browservm}  (?<!\#)testbed\.seleniumBrowser=.*  testbed\.seleniumBrowser=*%{SELENIUM_BROWSER}

    # populate common test provider props
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.datacenter=.*  testbed\.datacenter=${DATACENTER_NAME}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.pass=.*  testbed.pass=${TEST_VC_PASSWORD}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.host=.*  testbed.host=${ESX_HOST_IP}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.name=.*  testbed.name=${TEST_VC_IP}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.vsc\.url=.*  testbed\.vsc\.url=https\:\/\/${TEST_VC_IP}\/vsphere-client\/
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.cluster=.*  testbed\.cluster=${CLUSTER_NAME}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.endpoint=.*  testbed\.endpoint=${TEST_VC_IP}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.datastore\.type=.*  testbed\.datastore\.type=${DATASTORE_TYPE}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.datastore=.*  testbed\.datastore=${DATASTORE_NAME}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.host\.datastore\.name=.*  testbed\.host\.datastore\.name=${TEST_DATASTORE}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.datastore\.ip=.*  testbed\.datastore\.ip=${DATASTORE_IP}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.host\.password=.*  testbed\.host\.password=${ESX_HOST_PASSWORD}
    ${commontestbed}=  Replace String Using Regexp  ${commontestbed}  (?<!\#)testbed\.user=.*  testbed\.user=${TEST_VC_USERNAME}

    # populate host provider props
    ${host}=  Replace String Using Regexp  ${host}  (?<!\#)testbed\.endpoint=.*  testbed\.endpoint=${ESX_HOST_IP}
    ${host}=  Replace String Using Regexp  ${host}  (?<!\#)testbed\.local\.datastore\.name=.*  testbed\.local\.datastore\.name=${TEST_DATASTORE}
    ${host}=  Replace String Using Regexp  ${host}  (?<!\#)testbed\.pass=.*  testbed\.pass=${ESX_HOST_PASSWORD}

    # populate vicenv provider props
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.vc_version=.*  testbed\.vc_version=%{TEST_VSPHERE_VER}
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.vch_vm_name=.*  testbed\.vch_vm_name=${VCH_VM_NAME}
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.container_vm_name=.*  testbed\.container_vm_name=${CONTAINER_VM_TRUNCATED_NAME}
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.user=.*  testbed\.user=${TEST_VC_USERNAME}
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.pass=.*  testbed\.pass=${TEST_VC_PASSWORD}
    ${vicenv}=  Replace String Using Regexp  ${vicenv}  (?<!\#)testbed\.endpoint=.*  testbed\.endpoint=${TEST_VC_IP}

    Create File  ${NGC_TESTS_PATH}/resources/browservm.properties  ${browservm}
    Create File  ${NGC_TESTS_PATH}/resources/commonTestbedProvider.properties  ${commontestbed}
    Create File  ${NGC_TESTS_PATH}/resources/hostProvider.properties  ${host}
    Create File  ${NGC_TESTS_PATH}/resources/vicEnvProvider.properties  ${vicenv}
    Remove Files  ${NGC_TESTS_PATH}/resources/*.tpl.properties

Revert Config Files
    # revert the properties files to their original template files
    Remove Files  ${NGC_TESTS_PATH}/resources/*.properties
    Create File  ${NGC_TESTS_PATH}/resources/browservm.tpl.properties  ${browservm_original}
    Create File  ${NGC_TESTS_PATH}/resources/commonTestbedProvider.tpl.properties  ${commontestbed_original}
    Create File  ${NGC_TESTS_PATH}/resources/hostProvider.tpl.properties  ${host_original}
    Create File  ${NGC_TESTS_PATH}/resources/vicEnvProvider.tpl.properties  ${vicenv_original}

Create And Run Test Container
    Log To Console  \nCreating a busybox container...
    Set Environment Variable  DOCKER_CERT_PATH  ../../../%{VCH_VM_NAME}
    ${rc}=  Run And Return Rc  docker %{VCH-PARAMS} pull busybox
    Should Be Equal As Integers  ${rc}  0
    ${rc}  ${container_id}=  Run And Return Rc And Output  docker %{VCH-PARAMS} create -t busybox /bin/top
    Should Be Equal As Integers  ${rc}  0
    ${rc}=  Run And Return Rc  docker %{VCH-PARAMS} start ${container_id}
    Should Be Equal As Integers  ${rc}  0
    ${rc}  ${container_name}=  Run And Return Rc And Output  docker %{VCH-PARAMS} inspect ${container_id} | jq '.[0].Name' | sed 's/[\"\/]//g'
    Should Be Equal As Integers  ${rc}  0
    ${short_container_id}=  Get container shortID  ${container_id}
    Set Suite Variable  ${CONTAINER_VM_TRUNCATED_NAME}  ${container_name}-${short_container_id}

Launch Plugin Tests
    # run mvn test and make sure tests are successful. timeout is applied inside the custom library not here
    [Timeout]  NONE
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Log To Console  Starting Flex tests...  ELSE  Log To Console  Starting HSUIA tests...
    Log To Console  Selenium server is running at ${SELENIUM_SERVER_IP}
    Run Keyword If  %{TEST_VSPHERE_VER} == 60  Run Ngc Tests  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${SUITA_TESTS_EXTRACT_LOCATION}  ELSE  Run HSUIA Tests  ${HSUIA_TESTS_EXTRACT_LOCATION}
    ${results}=  Determine Pass Fail  %{TEST_VSPHERE_VER}
    Should Be True  ${results}

Determine Pass Fail
    [Arguments]  ${vc_version}
    ${results}=  Run Keyword If  ${vc_version} == 60  Determine Pass Fail For NGC Tests  ELSE  Determine Pass Fail For HSUIA Tests
    [Return]  ${results}

Determine Pass Fail For NGC Tests
    ${log_file}=  Set Variable  ngc_tests.log
    ${output}=  OperatingSystem.GetFile  ${log_file}
    ${cond1}=  Run Keyword And Return Status  Should Contain  ${output}  BUILD SUCCESS
    ${cond2}=  Run Keyword And Return Status  Should Not Contain  ${output}  BUILD FAILURE
    Log To Console  checking log
    Log To Console  ${output}
    [Return]  ${cond1} and ${cond2}

Determine Pass Fail for HSUIA Tests
    ${log_file}=  Set Variable  ngc_tests.log
    ${output}=  OperatingSystem.GetFile  ${log_file}
    ${results_folder}=  Set Variable  ${HSUIA_TESTS_EXTRACT_LOCATION}/results
    ${num_test_suites}=  Run  printf '%s' $(find ${results_folder} -name "com_vmware_vsphere*" | wc -l)
    ${success_count}=  Run  printf '%s' $(tail -${num_test_suites} ${log_file} | grep "PASSED" | wc -l)
    Log To Console  checking log
    Log To Console  ${output}
    [Return]  ${num_test_suites} == ${success_count}

Skip Ngc Tests
    Log To Console  Target VC is 5.5 which is not supported by NGC automation test framework. Skipping...

Clean Up Testbed Config Files
    @{files}=  Run Keyword If  %{TEST_VSPHERE_VER} == 60  OperatingSystem.List Directory  ${NGC_TESTS_PATH}/resources  *tpl.properties
    ${num_tpl_files}=  Get Length  ${files}
    Run Keyword If  %{TEST_VSPHERE_VER} == 60 and ${num_tpl_files} == 0  Revert Config Files

Download And Unzip HSUIA
    Run  rm -rf ${HSUIA_TESTS_EXTRACT_LOCATION} 2>/dev/null
    ${rc}  ${out}=  Run And Return Rc And Output  curl -sLk ${HSUIA_TESTS_ZIP_URL} -o /tmp/${HSUIA_TESTS}.zip
    Log To Console  ${out}
    Run Keyword Unless  ${rc} == 0  Fatal Error  Failed to download ${HSUIA_TESTS_ZIP_URL} to ${HSUIA_TESTS_EXTRACT_LOCATION}!
    ${rc2}=  Run And Return Rc  unzip -oj -d ${HSUIA_TESTS_EXTRACT_LOCATION} /tmp/${HSUIA_TESTS}.zip "*.jar" "*.sh" -x "*logback-classic*?"
    Run Keyword Unless  ${rc2} == 0  Fatal Error  Failed to unzip the /tmp/${HSUIA_TESTS}.zip file!

Build Vicui HSUIA Project
    ${rc}  ${out}=  Run And Return Rc And Output  ant -f ${VICUIA_H5C_BUILDFILE} -Denv.HSUIA_LOCATION=${HSUIA_TESTS_EXTRACT_LOCATION}
    Run Keyword Unless  ${rc} == 0  Fatal Error  ${out}
    Log To Console  vic-uia build result: ${rc}

Download And Unzip SUITA
    Run  rm -rf ${SUITA_TESTS_EXTRACT_LOCATION} 2>/dev/null
    ${rc}  ${out}=  Run And Return Rc And Output  curl -sLk ${SUITA_TESTS_ZIP_URL} -o /tmp/${SUITA_TESTS}.zip
    Log To Console  ${out}
    Run Keyword Unless  ${rc} == 0  Fatal Error  Failed to download ${SUITA_TESTS_ZIP_URL} to ${SUITA_TESTS_EXTRACT_LOCATION}!
    ${rc2}=  Run And Return Rc  unzip -o -d ${SUITA_TESTS_EXTRACT_LOCATION} /tmp/${SUITA_TESTS}.zip
    Run Keyword Unless  ${rc2} == 0  Fatal Error  Failed to unzip the /tmp/${SUITA_TESTS}.zip file!
