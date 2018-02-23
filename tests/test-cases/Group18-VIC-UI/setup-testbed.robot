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
Documentation  Set up testbed before running the UI tests
Resource  ../../resources/Util.robot
Resource  ./vicui-common.robot
Suite Teardown  Close All Connections

*** Keywords ***
Check If Nimbus VMs Exist
    # remove testbed-information if it exists
    ${ti_exists}=  Run Keyword And Return Status  OperatingSystem.Should Exist  testbed-information
    Run Keyword If  ${ti_exists}  Remove File  testbed-information

    ${nimbus_machines}=  Set Variable  %{NIMBUS_USER}-UITEST-*
    Log To Console  \nFinding Nimbus machines for UI tests
    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}

    Execute Command  rm -rf public_html/pxe/*
    ${out}=  Execute Command  nimbus-ctl list | grep -i "${nimbus_machines}"
    @{out}=  Split To Lines  ${out}
    ${out_len}=  Get Length  ${out}
    Close connection

    Run Keyword If  ${out_len} == 0  Setup Testbed  ELSE  Load Testbed  ${out}
    Create File  testbed-information  TEST_VSPHERE_VER=%{TEST_VSPHERE_VER}\nSELENIUM_SERVER_IP=%{SELENIUM_SERVER_IP}\nTEST_ESX_NAME=%{TEST_ESX_NAME}\nESX_HOST_IP=%{ESX_HOST_IP}\nESX_HOST_PASSWORD=%{ESX_HOST_PASSWORD}\nTEST_VC_NAME=%{TEST_VC_NAME}\nTEST_VC_IP=%{TEST_VC_IP}\nTEST_URL_ARRAY=%{TEST_URL_ARRAY}\nTEST_USERNAME=%{TEST_USERNAME}\nTEST_PASSWORD=%{TEST_PASSWORD}\nTEST_DATASTORE=datastore1\nEXTERNAL_NETWORK=%{EXTERNAL_NETWORK}\nTEST_TIMEOUT=%{TEST_TIMEOUT}\nGOVC_INSECURE=%{GOVC_INSECURE}\nGOVC_USERNAME=%{GOVC_USERNAME}\nGOVC_PASSWORD=%{GOVC_PASSWORD}\nGOVC_URL=%{GOVC_URL}\n

Destroy Testbed
    [Arguments]  ${name}
    Log To Console  Destroying VM(s) ${name}
    Run Keyword And Ignore Error  Kill Nimbus Server  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  ${name}

Load Testbed
    [Arguments]  ${list}
    Log To Console  Retrieving VMs information for UI testing...\n
    ${len}=  Get Length  ${list}
    @{browservm-found}=  Create List
    @{esx-found}=  Create List
    @{vcsa-found}=  Create List
    ${browservm-requested}=  Run Keyword If  '%{TEST_OS}' == 'Ubuntu'  Set Variable  BROWSERVM-UBUNTU  ELSE  Set Variable  BROWSERVM-WINDOWS
    :FOR  ${vm}  IN  @{list}
    \  @{vm_items}=  Split String  ${vm}  :
    \  ${is_esx}=  Run Keyword And Return Status  Should Match Regexp  @{vm_items}[1]  (?i)esx%{TEST_VSPHERE_VER}
    \  ${is_vcsa}=  Run Keyword And Return Status  Should Match Regexp  @{vm_items}[1]  (?i)vc%{TEST_VSPHERE_VER}
    \  ${is_browservm}=  Run Keyword And Return Status  Should Match Regexp  @{vm_items}[1]  (?i)${browservm-requested}
    \  Run Keyword If  ${is_browservm}  Set Test Variable  @{browservm-found}  @{vm_items}  ELSE IF  ${is_esx}  Set Test Variable  @{esx-found}  @{vm_items}  ELSE IF  ${is_vcsa}  Set Test Variable  @{vcsa-found}  @{vm_items}
    ${browservm_len}=  Get Length  ${browservm-found}
    ${esx_len}=  Get Length  ${esx-found}
    ${vcsa_len}=  Get Length  ${vcsa-found}
    Run Keyword If  ${browservm_len} > 0  Extract BrowserVm Info  @{browservm-found}  ELSE  Deploy BrowserVm
    Run Keyword If  (${esx_len} == 0 and ${vcsa_len} > 0) or (${esx_len} > 0 and ${vcsa_len} == 0)  Run Keywords  Destroy Testbed  %{NIMBUS_USER}-UITEST-VC%{TEST_VSPHERE_VER}*  AND  Destroy Testbed  %{NIMBUS_USER}-UITEST-ESX%{TEST_VSPHERE_VER}*  AND  Deploy Esx  AND  Deploy Vcsa
    Run Keyword If  ${esx_len} == 0 and ${vcsa_len} == 0  Run Keywords  Deploy Esx  AND  Deploy Vcsa
    Run Keyword If  ${esx_len} > 0 and ${vcsa_len} > 0  Run Keywords  Extract Esx Info  @{esx-found}  AND  Extract Vcsa Info  @{vcsa-found}

Extract BrowserVm Info
    [Arguments]  @{vm_fields}
    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}
    ${vm_name}=  Evaluate  '@{vm_fields}[1]'.strip()
    ${out}=  Execute Command  NIMBUS=@{vm_fields}[0] nimbus-ctl ip ${vm_name} | grep -i ".*: %{NIMBUS_USER}-.*"
    @{out}=  Split String  ${out}  :
    ${vm_ip}=  Evaluate  '@{out}[2]'.strip()
    Run Keyword If  '%{TEST_OS}' == 'Mac'  Set Environment Variable  SELENIUM_SERVER_IP  ${MACOS_HOST_IP}  ELSE IF  '%{TEST_OS}' == 'Ubuntu'  Set Environment Variable  SELENIUM_SERVER_IP  ${UBUNTU_HOST_IP}  ELSE  Set Environment Variable  SELENIUM_SERVER_IP  ${vm_ip}
    Close Connection

Extract Esx Info
    [Arguments]  @{vm_fields}
    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}
    ${vm_name}=  Evaluate  '@{vm_fields}[1]'.strip()
    ${out}=  Execute Command  NIMBUS=@{vm_fields}[0] nimbus-ctl ip ${vm_name} | grep -i ".*: %{NIMBUS_USER}-.*"
    @{out}=  Split String  ${out}  :
    ${vm_ip}=  Evaluate  '@{out}[2]'.strip()
    Set Environment Variable  TEST_ESX_NAME  ${vm_name}
    Set Environment Variable  ESX_HOST_IP  ${vm_ip}
    Set Environment Variable  ESX_HOST_PASSWORD  e2eFunctionalTest
    Close Connection

Extract Vcsa Info
    [Arguments]  @{vm_fields}
    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}
    ${vm_name}=  Evaluate  '@{vm_fields}[1]'.strip()
    ${out}=  Execute Command  NIMBUS=@{vm_fields}[0] nimbus-ctl ip ${vm_name} | grep -i ".*: %{NIMBUS_USER}-.*"
    @{out}=  Split String  ${out}  :
    ${vm_ip}=  Evaluate  '@{out}[2]'.strip()
    Set Environment Variable  TEST_VC_NAME  ${vm_name}
    Set Environment Variable  TEST_VC_IP  ${vm_ip}
    Set Environment Variable  TEST_URL_ARRAY  ${vm_ip}
    Set Environment Variable  TEST_USERNAME  Administrator@vsphere.local
    Set Environment Variable  TEST_PASSWORD  Admin\!23
    Set Environment Variable  EXTERNAL_NETWORK  vm-network
    Set Environment Variable  TEST_TIMEOUT  30m
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  Administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Admin\!23
    Set Environment Variable  GOVC_URL  ${vm_ip}
    Close Connection

Deploy BrowserVm
    # deploy a browser vm
    ${browservm}  ${browservm-ip}=  Run Keyword If  '%{TEST_OS}' == 'Mac'  No Operation  ELSE IF  '%{TEST_OS}' == 'Ubuntu'  No Operation  ELSE  Deploy Windows BrowserVm  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}
    Run Keyword If  '%{TEST_OS}' == 'Mac'  Set Environment Variable  SELENIUM_SERVER_IP  ${MACOS_HOST_IP}  ELSE IF  '%{TEST_OS}' == 'Ubuntu'  Set Environment Variable  SELENIUM_SERVER_IP  ${UBUNTU_HOST_IP}  ELSE  Set Environment Variable  SELENIUM_SERVER_IP  ${browservm-ip}

Deploy Esx
    [Arguments]  ${build}=None  ${logfile}=None
    # deploy an esxi server
    ${name}=  Evaluate  'UITEST-ESX%{TEST_VSPHERE_VER}-' + str(random.randint(1000,9999))  modules=random
    ${buildnum}=  Run Keyword If  ${build} is not None  Set Variable  ${build}  ELSE  Run Keyword If  %{TEST_VSPHERE_VER} == 60  Set Variable  3620759  ELSE  Set Variable  5310538

    Log To Console  \nDeploying Nimbus ESXi server: ${name}

    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  retry_interval=30 sec
    # run nimbus command and make sure deployment was successful
    ${output}=  Execute Command  nimbus-esxdeploy ${name} --disk\=50000000 --memory\=8192 --lease=1 --nics 2 ${buildnum}
    Run Keyword If  ${logfile} is not None  Create File  ${logfile}  ${output}
    Should Contain  ${output}  To manage this VM use

    ${esx1-ip}=  Get IP  ${name}
    Remove Environment Variable  GOVC_PASSWORD
    Remove Environment Variable  GOVC_USERNAME
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_URL  root:@${esx1-ip}
    ${out}=  Run  govc host.account.update -id root -password e2eFunctionalTest
    Should Be Empty  ${out}
    Log To Console  Successfully deployed %{NIMBUS_USER}-${name}. IP: ${esx1-ip}
    Close Connection

    Set Environment Variable  TEST_ESX_NAME  %{NIMBUS_USER}-${name}
    Set Environment Variable  ESX_HOST_IP  ${esx1-ip}
    Set Environment Variable  ESX_HOST_PASSWORD  e2eFunctionalTest

Deploy Vcsa
    [Arguments]  ${build}=None  ${logfile}=None
    # deploy a vcsa
    ${name}=  Evaluate  'UITEST-VC%{TEST_VSPHERE_VER}-' + str(random.randint(1000,9999))  modules=random
    ${buildnum}=  Run Keyword If  ${build} is not None  Set Variable  ${build}  ELSE  Run Keyword If  %{TEST_VSPHERE_VER} == 60  Set Variable  3634791  ELSE  Set Variable  7312210

    Log To Console  \nDeploying Nimbus VC server: ${name}

    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  retry_interval=30 sec
    # run nimbus command and make sure deployment was successful
    ${output}=  Execute Command  nimbus-vcvadeploy --lease\=1 --useQaNgc --vcvaBuild ${buildnum} ${name}
    Run Keyword If  ${logfile} is not None  Create File  ${logfile}  ${output}
    Should Contain  ${output}  To manage this VM use
    
    ${vc-ip}=  Get IP  ${name}
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  Administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Admin!23
    Set Environment Variable  GOVC_URL  ${vc-ip}
    Log To Console  Successfully deployed %{NIMBUS_USER}-${name}. IP: ${vc-ip}
    Close Connection

    # create a datacenter
    Log To Console  Create a datacenter on the VC
    ${out}=  Run  govc datacenter.create Datacenter
    Should Be Empty  ${out}

    # make a cluster
    Log To Console  Create a cluster on the datacenter
    ${out}=  Run  govc cluster.create -dc=Datacenter Cluster
    Should Be Empty  ${out}
    ${out}=  Run  govc cluster.change -dc=Datacenter -drs-enabled=true /Datacenter/host/Cluster
    Should Be Empty  ${out}

    # add the esx host to the cluster
    Log To Console  Add ESX host to Cluster
    ${out}=  Run  govc cluster.add -dc=Datacenter -cluster=/Datacenter/host/Cluster -username=root -password=e2eFunctionalTest -noverify=true -hostname=%{ESX_HOST_IP}
    Should Contain  ${out}  OK

    # create a distributed switch
    Log To Console  Create a distributed switch
    ${out}=  Run  govc dvs.create -dc=Datacenter test-ds
    Should Contain  ${out}  OK

    # make three port groups
    Log To Console  Create three new distributed switch port groups for management and vm network traffic
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds management
    Should Contain  ${out}  OK
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds vm-network
    Should Contain  ${out}  OK
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds network
    Should Contain  ${out}  OK

    Log To Console  Add the ESXi hosts to the portgroups
    ${out}=  Run  govc dvs.add -dvs=test-ds -pnic=vmnic1 -host.ip=%{ESX_HOST_IP} %{ESX_HOST_IP}
    Should Contain  ${out}  OK

    Set Environment Variable  TEST_VC_NAME  %{NIMBUS_USER}-${name}
    Set Environment Variable  TEST_VC_IP  ${vc-ip}
    Set Environment Variable  TEST_URL_ARRAY  ${vc-ip}
    Set Environment Variable  TEST_USERNAME  Administrator@vsphere.local
    Set Environment Variable  TEST_PASSWORD  Admin\!23
    Set Environment Variable  EXTERNAL_NETWORK  vm-network
    Set Environment Variable  TEST_TIMEOUT  30m
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  Administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Admin\!23
    Set Environment Variable  GOVC_URL  ${vc-ip}

Setup Testbed
    Deploy BrowserVm
    Deploy Esx
    Deploy Vcsa

Deploy Windows BrowserVm
    [Arguments]  ${user}  ${password}  ${vm-template}=hsuia-seleniumNode-w7x64
    ${os}=  Set Variable  WINDOWS
    ${name}=  Evaluate  'UITEST-BROWSERVM-${os}-' + str(random.randint(1000,9999))  modules=random
    Log To Console  \nDeploying Browser VM: ${name}
    Open SSH Connection  %{NIMBUS_GW}  ${user}  ${password}

    ${out}=  Execute Command  nimbus-genericdeploy --type ${vm-template} ${name} --lease 1
    # Make sure the deploy actually worked
    Should Contain  ${out}  To manage this VM use
    # Now grab the IP address and return the name and ip for later use
    @{out}=  Split To Lines  ${out}
    :FOR  ${item}  IN  @{out}
    \   ${status}  ${message}=  Run Keyword And Ignore Error  Should Contain  ${item}  IP is
    \   Run Keyword If  '${status}' == 'PASS'  Set Suite Variable  ${line}  ${item}
    @{gotIP}=  Split String  ${line}  ${SPACE}
    ${ip}=  Remove String  @{gotIP}[5]  ,

    Log To Console  Successfully deployed new Browser VM - ${user}-${name}
    Close connection
    [Return]  ${user}-${name}  ${ip}

*** Test Cases ***
Predeploy Vc And Esx
    [Tags]  presetup
    Load Secrets  ../../../ui/vic-uia/test.secrets
    Environment Variable Should Be Set  NIMBUS_USER
    Environment Variable Should Be Set  NIMBUS_GW
    Environment Variable Should Be Set  NIMBUS_PASSWORD
    Environment Variable Should Be Set  TEST_DATASTORE
    Environment Variable Should Be Set  TEST_RESOURCE
    Set Environment Variable  GOVC_INSECURE  1
    @{VSPHERE_BUILDS_LIST}=  Create List
    Append To List  ${VSPHERE_BUILDS_LIST}  65-5310538-7312210

    Log To Console  \n==============================================================================
    Log To Console  This script will destroy all vSphere 6.0 and 6.5 instances plus Windows Browser VM
    Log To Console  on Nimbus and redeploy them. If you wish to cancel, press ctrl + c within 10 seconds.
    Log To Console  ==============================================================================
    Sleep  10s

    :FOR  ${item}  IN  @{VSPHERE_BUILDS_LIST}
    \  @{split}=  Split String  ${item}  -
    \  Set Environment Variable  TEST_VSPHERE_VER  @{split}[0]
    \  Log To Console  \nDestroying any existing ESX instance: %{NIMBUS_USER}-UITEST-ESX@{split}[0]*...
    \  Destroy Testbed  %{NIMBUS_USER}-UITEST-ESX@{split}[0]*
    \  Log To Console  Deploying an ESXi instance with build ob-@{split}[1]...
    \  Deploy Esx  @{split}[1]
    \  Log To Console  \nDestroying any existing VC instance: %{NIMBUS_USER}-UITEST-VC@{split}[0]*...
    \  Destroy Testbed  %{NIMBUS_USER}-UITEST-VC@{split}[0]*
    \  Log To Console  \nDeploying a VC instance with build ob-@{split}[2]...
    \  Deploy Vcsa  @{split}[2]

    Log To Console  \nDestroying Windows VM instance: %{NIMBUS_USER}-UITEST-BROWSERVM-WINDOWS*...
    Destroy Testbed  %{NIMBUS_USER}-UITEST-BROWSERVM-WINDOWS*
    Log To Console  \nDeploying a Windows Browser wVM instance using template hsuia-seleniumNode-w7x64...
    Deploy Windows BrowserVm  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  hsuia-seleniumNode-w7x64

Check Variables
    ${isset_SHELL}=  Run Keyword And Return Status  Environment Variable Should Be Set  SHELL
    ${isset_GOVC_INSECURE}=  Run Keyword And Return Status  Environment Variable Should Be Set  GOVC_INSECURE
    Log To Console  \nChecking environment variables
    Log To Console  SHELL ${isset_SHELL}
    Log To Console  GOVC_INSECURE ${isset_GOVC_INSECURE}
    Log To Console  TEST_VSPHERE_VER %{TEST_VSPHERE_VER}
    Should Be True  ${isset_SHELL} and ${isset_GOVC_INSECURE} and %{TEST_VSPHERE_VER}

Get VMs Information
    # remove testbed-information if it exists
    ${ti_exists}=  Run Keyword And Return Status  OperatingSystem.Should Exist  testbed-information
    Run Keyword If  ${ti_exists}  Remove File  testbed-information

    # choose which selenium grid to use
    Run Keyword If  '%{TEST_OS}' == 'Mac'  Set Environment Variable  SELENIUM_SERVER_IP  ${MACOS_HOST_IP}  ELSE  Set Environment Variable  SELENIUM_SERVER_IP  ${WINDOWS_HOST_IP}

    ${esx_ip}=  Set Variable  ${BUILD_%{TEST_ESX_BUILD}_IP}
    ${vcsa_ip}=  Set Variable  ${BUILD_%{TEST_VCSA_BUILD}_IP}

    ${testbed-information-content}=  Catenate  SEPARATOR=\n
    ...  TEST_VSPHERE_VER=%{TEST_VSPHERE_VER}
    ...  SELENIUM_SERVER_IP=%{SELENIUM_SERVER_IP}
    ...  TEST_ESX_NAME=esx-%{TEST_ESX_BUILD}
    ...  ESX_HOST_IP=${esx_ip}
    ...  ESX_HOST_PASSWORD=ca*hc0w
    ...  TEST_VC_NAME=vc-%{TEST_VCSA_BUILD}
    ...  TEST_VC_IP=${vcsa_ip}
    ...  TEST_URL_ARRAY=${vcsa_ip}
    ...  TEST_USERNAME=Administrator@vsphere.local
    ...  TEST_PASSWORD=Admin\!23
    ...  TEST_DATASTORE=${TEST_DATASTORE}
    ...  EXTERNAL_NETWORK=vm-network
    ...  TEST_TIMEOUT=30m
    ...  GOVC_INSECURE=1
    ...  GOVC_USERNAME=Administrator@vsphere.local
    ...  GOVC_PASSWORD=Admin\!23
    ...  GOVC_URL=${vcsa_ip}\n

    Create File  testbed-information  ${testbed-information-content}

Deploy VCH
    Load Nimbus Testbed Env
    ${uname_v}=  Run  uname -v
    ${is_macos}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    ${vic-machine-binary}=  Run Keyword If  ${is_macos}  Set Variable  vic-machine-darwin  ELSE  Set Variable  vic-machine-linux
    ${vic-ui-binary}=  Run Keyword If  ${is_macos}  Set Variable  vic-ui-darwin  ELSE  Set Variable  vic-ui-linux
    Set Environment Variable  TEST_RESOURCE  ${TEST_RESOURCE}
    Install VIC Appliance For VIC UI  ui-nightly-run-bin/${vic-machine-binary}  ui-nightly-run-bin/appliance.iso  ui-nightly-run-bin/bootstrap.iso
    Append To File  testbed-information  VCH-PARAMS=%{VCH-PARAMS}\n

    Append To File  testbed-information  TEST_OS=%{TEST_OS}\n
    Append To File  testbed-information  DRONE_BUILD_NUMBER=%{DRONE_BUILD_NUMBER}\n
    Append To File  testbed-information  BRIDGE_NETWORK=%{BRIDGE_NETWORK}\n
    Append To File  testbed-information  TEST_DATACENTER=${TEST_DATACENTER}\n
    Append To File  testbed-information  TEST_URL=%{TEST_URL}\n
    Append To File  testbed-information  VCH_VM_NAME=%{VCH-NAME}\n
    Append To File  testbed-information  VCH-IP=%{VCH-IP}\n
    Append To File  testbed-information  VIC-ADMIN=%{VIC-ADMIN}\n
    Append To File  testbed-information  GOVC_RESOURCE_POOL=%{GOVC_RESOURCE_POOL}\n
    Append To File  testbed-information  GOVC_DATASTORE=%{GOVC_DATASTORE}\n
    Append To File  testbed-information  HOST_TYPE=%{HOST_TYPE}\n
    Append To File  testbed-information  DATASTORE_TYPE=%{DATASTORE_TYPE}\n
    Append To File  testbed-information  vicmachinetls=${vicmachinetls}\n

    ${vc_fingerprint}=  Run  ui-nightly-run-bin/${vic-ui-binary} info --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --target ${TEST_VC_IP} --key com.vmware.vic.noop 2>&1 | grep -o "(thumbprint.*)" | awk -F= '{print $2}' | sed 's/.$//'
    Append To File  testbed-information  VC_FINGERPRINT=${vc_fingerprint}\n
    Append To File  testbed-information  TEST_THUMBPRINT=${vc_fingerprint}\n
