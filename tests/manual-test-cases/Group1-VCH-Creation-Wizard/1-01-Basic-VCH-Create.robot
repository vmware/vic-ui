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
Suite Teardown  Cleanup Testbed
Suite Setup  Prepare Testbed

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot
${TMP_OVA_LOCATION}  /tmp/vic-product-ova-for-test.ova
${OVA_ESX_HOST}  10.160.217.137

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
    Set Environment Variable  GOVC_URL  ${BUILD_5318154_IP}
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Admin!23

    Variable Should Exist  ${ova_url}
    Log To Console  Downloading VIC Product OVA at ${ova_url}
    # TODO: uncomment the following 3 lines
    #${rc}=  Run And Return Rc  curl -sLk ${ova_url} -o ${TMP_OVA_LOCATION}
    #Should Be True  ${rc} == 0
    #OperatingSystem.File Should Exist  ${TMP_OVA_LOCATION}
    Log To Console  OVA successfully downloaded
    Log To Console  Target vSphere is 6.5 (ob5318154): ${BUILD_5318154_IP}

    # make sure to run robot with the ${ova_url} variable specified as in
    # robot --variable ova_url:https://storage.googleapis.com/vic-product-ova-builds/build-to-test.ova
    Install VIC Product OVA  ${TMP_OVA_LOCATION}

    # install VCH and VIC UI plugin

Cleanup Testbed
    Close All Browsers
    Log To Console  Cleaning up
    # OperatingSystem.Remove Files  ${TMP_OVA_LOCATION}
    Cleanup VIC Product OVA  ${ova_name}
    Remove Environment Variable  GOVC_URL  GOVC_INSECURE  GOVC_USERNAME  GOVC_PASSWORD

Run GOVC
    [Arguments]  ${cmd_options}
    ${rc}  ${output}=  Run And Return Rc And Output  govc ${cmd_options}
    Log  ${output}
    Should Be Equal As Integers  ${rc}  0
    [Return]  ${rc}

Install VIC Product OVA
    [Arguments]  ${ova-file}
    Log To Console  \nInstalling VIC appliance...
    ${OVA_NAME}=  Evaluate  'OVA-' + str(random.randint(1000,9999))  modules=random 
    ${output}=  Run  ovftool --datastore='datastore1 (4)' --noSSLVerify --acceptAllEulas --name=${OVA_NAME} --diskMode=thin --powerOn --X:waitForIp --X:injectOvfEnv --X:enableHiddenProperties --prop:appliance.root_pwd='Admin!23' --prop:appliance.permit_root_login=True --net:"Network"="VM Network" ${ova-file} 'vi://administrator@vsphere.local:Admin!23@${BUILD_5318154_IP}${TEST_DATACENTER}/host/${OVA_ESX_HOST}'
    Should Contain  ${output}  Completed successfully
    Should Contain  ${output}  Received IP address:
    Set Global Variable  ${ova_name}  ${OVA_NAME}

    ${output}=  Split To Lines  ${output} 
    :FOR  ${line}  IN  @{output}
    \   ${status}=  Run Keyword And Return Status  Should Contain  ${line}  Received IP address:
    \   ${ip}=  Run Keyword If  ${status}  Fetch From Right  ${line}  ${SPACE}
    \   Run Keyword If  ${status}  Set Environment Variable  OVA_IP  ${ip}

    Log To Console  \nWaiting for Getting Started Page to Come Up...
    :FOR  ${i}  IN RANGE  10
    \   ${rc}  ${out}=  Run And Return Rc And Output  curl -k -w "\%{http_code}\\n" --header "Content-Type: application/json" -X POST --data '{"target":"${BUILD_5318154_IP}:443","user":"administrator@vsphere.local","password":"Admin!23"}' https://%{OVA_IP}:9443/register 2>/dev/null
    \   Exit For Loop If  '200' in '''${out}'''
    \   Sleep  5s
    Log To Console  ${rc}
    Log To Console  ${out}
    Should Contain  ${out}  200

    Log  %{OVA_IP}

Download VIC Engine
    [Arguments]  ${target_dir}=bin
    Log To Console  \nDownloading VIC engine...
    ${download_file}=  Run command and Return output  curl -sLk https://%{OVA_IP}:9443/files | grep -m 1 -o "vic_[[:digit:]]\+.tar.gz" | tail -1
    ${download_url}=  Set Variable  https://%{OVA_IP}:9443/files/${download_file}
    Run command and Return output  mkdir -p ${target_dir}
    Run command and Return output  curl -k ${download_url} --output ${target_dir}/vic.tar.gz
    Run command and Return output  tar -xvzf ${target_dir}/vic.tar.gz --strip-components=1 --directory=${target_dir}

Download VIC Engine If Not Already
    [Arguments]  ${target_dir}=bin
    ${status}=  Run Keyword And Return Status  Directory Should Not Be Empty  ${target_dir}
    Run Keyword Unless  ${status}  Download VIC engine

Cleanup VIC Product OVA
    [Arguments]  ${ova_target_vm_name}
    Log To Console  \nCleaning up VIC appliance...
    ${rc}=  Wait Until Keyword Succeeds  10x  5s  Run GOVC  vm.destroy ${ova_target_vm_name}
    Run Keyword And Ignore Error  Run GOVC  datastore.rm "/datastore1 (4)/vm/${ova_target_vm_name}"
    Run Keyword if  ${rc} == 0  Log To Console  \nVIC Product OVA deployment ${ova_target_vm_name} is cleaned up on test server ${BUILD_5318154_IP}

*** Test Cases ***
Test
    Log To Console  OVA IP is %{OVA_IP}
