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
Destroy Testbed
    [Arguments]  ${name}
    Log To Console  Destroying VM(s) ${name}
    Run Keyword And Ignore Error  Kill Nimbus Server  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  ${name}

Run SSHPASS And Log To File
    [Arguments]  ${host}  ${user}  ${password}  ${cmd}  ${logfile}=STDOUT
    ${out}=  Start Process  sshpass -p ${password} ssh -o StrictHostKeyChecking\=no ${user}@${host} ${cmd}  shell=True  stdout=${logfile}  stderr=STDOUT
    [Return]  ${out}

Deploy ESXi Server On Nimbus Async
    [Arguments]  ${name}  ${build}=None
    Log To Console  \nDeploying Nimbus ESXi server: ${name}
    ${cmd}=  Evaluate  'nimbus-esxdeploy ${name} --disk\=50000000 --memory\=8192 --lease=1 --nics 2 ${build}'
    ${out}=  Run SSHPASS And Log To File  %{NIMBUS_GW}  %{NIMBUS_USER}  '%{NIMBUS_PASSWORD}'  ${cmd}  sshpass-stdout-${name}.log
    [Return]  ${out}

Deploy VC On Nimbus Async
    [Arguments]  ${name}  ${build}=None
    Log To Console  \nDeploying Nimbus VC server: ${name}
    ${cmd}=  Evaluate  'nimbus-vcvadeploy --lease\=1 --useQaNgc --vcvaBuild ${build} ${name}'
    ${out}=  Run SSHPASS And Log To File  %{NIMBUS_GW}  %{NIMBUS_USER}  '%{NIMBUS_PASSWORD}'  ${cmd}  sshpass-stdout-${name}.log
    [Return]  ${out}

Configure Vcsa
    [Arguments]  ${name}  ${vc_fqdn}  ${esxi_list}
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  Administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Admin!23
    Set Environment Variable  GOVC_URL  ${vc_fqdn}

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
    :FOR  ${esxi}  IN  @{esxi_list}
    \  ${esxi_name}=  Get From Dictionary  ${esxi}  name
    \  ${esxi_ip}=  Get From Dictionary  ${esxi}  ip
    \  ${is_standalone}=  Run Keyword And Return Status  Dictionary Should Contain Key  ${esxi}  standalone
    \  Run Keyword Unless  ${is_standalone}  Log To Console  Add ESX host ${esxi_name} to Cluster
    \  Run Keyword If  ${is_standalone}  Log To Console  Add standalone ESX host ${esxi_name}
    \  ${out_cluster}=  Run Keyword Unless  ${is_standalone}  Run  govc cluster.add -dc=Datacenter -cluster=/Datacenter/host/Cluster -username=root -password=e2eFunctionalTest -noverify=true -hostname=${esxi_ip}
    \  ${out_standalone}=  Run Keyword If  ${is_standalone}  Run  govc host.add -dc=Datacenter -username=root -password=e2eFunctionalTest -noverify=true -hostname=${esxi_ip}
    \  Run Keyword Unless  ${is_standalone}  Log  ${out_cluster}
    \  Run Keyword Unless  ${is_standalone}  Should Contain  ${out_cluster}  OK
    \  Run Keyword If  ${is_standalone}  Log  ${out_standalone}
    \  Run Keyword If  ${is_standalone}  Should Contain  ${out_standalone}  OK

    # create a distributed switch
    Log To Console  Create a distributed switch
    ${out}=  Run  govc dvs.create -dc=Datacenter test-ds
    Should Contain  ${out}  OK

    # make four port groups
    Log To Console  Create four new distributed switch port groups for management and vm network traffic
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds bridge
    Should Contain  ${out}  OK
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds management
    Should Contain  ${out}  OK
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds vm-network
    Should Contain  ${out}  OK
    ${out}=  Run  govc dvs.portgroup.add -nports 12 -dc=Datacenter -dvs=test-ds network
    Should Contain  ${out}  OK

    :FOR  ${esxi}  IN  @{esxi_list}
    \  ${esxi_name}=  Get From Dictionary  ${esxi}  name
    \  ${esxi_ip}=  Get From Dictionary  ${esxi}  ip
    \  Log To Console  Add the ESXi host ${esxi_name} to the portgroups
    \  ${out}=  Run  govc dvs.add -dvs=test-ds -pnic=vmnic1 -host.ip=${esxi_ip} ${esxi_ip}
    \  Log  ${out}
    \  Should Contain  ${out}  OK

    [Return]  %{NIMBUS_USER}-${name}

Prepare VIC UI Testbed
    [Arguments]  ${testbed_config}
    ${randname_snippet}=  Evaluate  'E2E-' + str(random.randint(1000,9999))  modules=random
    Set Environment Variable  E2E_RUN_NUMBER  ${randname_snippet}

    # Deploy the given number of ESXis    
    ${esxbuild}=  Get From Dictionary  ${testbed_config}  esx_build
    ${esxnum}=  Get From Dictionary  ${testbed_config}  esx_num
    ${esxnum}=  Evaluate  ${esxnum} + 1

    @{pids}=  Create List
    @{esxi_names}=  Create List
    @{esxi_deploy_results}=  Create List

    # asynchronously deploy ESXi and VC VMs
    :FOR  ${idx}  IN RANGE  1  ${esxnum}
    \  ${name}=  Evaluate  '${randname_snippet}-ESX-${esxbuild}-${idx}'
    \  Append To List  ${esxi_names}  ${name}
    \  ${pid}=  Deploy ESXi Server On Nimbus Async  ${name}  ${esxbuild}
    \  Append To List  ${pids}  ${pid}

    ${vcbuild}=  Get From Dictionary  ${testbed_config}  vc_build
    ${vc_name}=  Evaluate  '${randname_snippet}-VC-${vcbuild}'
    ${vc_deploy_pid}=  Deploy VC On Nimbus Async  ${vc_name}  ${vcbuild}

    # wait until all processes end
    :FOR  ${pid}  IN  @{pids}
    \  ${results}=  Wait For Process  ${pid}
    \  Should Contain  ${results.stdout}  To manage this VM use

    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  retry_interval=30 sec
    Remove Environment Variable  GOVC_PASSWORD
    Remove Environment Variable  GOVC_USERNAME
    Set Environment Variable  GOVC_INSECURE  1
    :FOR  ${esxi_name}  IN  @{esxi_names}
    \  ${esxi_ip}=  Get IP  ${esxi_name}
    \  &{vm}=  Create Dictionary
    \  Set To Dictionary  ${vm}  name  %{NIMBUS_USER}-${esxi_name}
    \  Set To Dictionary  ${vm}  ip  ${esxi_ip}
    \  Set To Dictionary  ${vm}  build  ${esxbuild}
    \  ${idx}=  Get Index from List  ${esxi_names}  ${esxi_name}
    \  ${standalone_host_idx}=  Evaluate  ${esxnum} - 2
    \  Run Keyword If  ${idx} == ${standalone_host_idx}  Set To Dictionary  ${vm}  standalone  ${TRUE}
    \  Append To List  ${esxi_deploy_results}  ${vm}
    \  # set root password for the esxi vms
    \  Set Environment Variable  GOVC_URL  root:@${esxi_ip}
    \  ${out}=  Run  govc host.account.update -id root -password e2eFunctionalTest
    \  Should Be Empty  ${out}
    \  Log To Console  Successfully deployed %{NIMBUS_USER}-${esxi_name}. IP: ${esxi_ip}
    Close Connection

    Log To Console  \nESXi deployment completed
    
    ${vc_deploy_results}=  Wait For Process  ${vc_deploy_pid}
    Should Contain  ${vc_deploy_results.stdout}  To manage this VM use
    ${ret}  ${vc_fqdn}=  Should Match Regexp  ${vc_deploy_results.stdout}  principal network identity: (.*)

    ${vm_name}=  Configure Vcsa  ${vc_name}  ${vc_fqdn}  ${esxi_deploy_results}
    &{vc_deploy_results}=  Create Dictionary
    Set To Dictionary  ${vc_deploy_results}  name  ${vm_name}
    Set To Dictionary  ${vc_deploy_results}  ip  ${vc_fqdn}
    Set To Dictionary  ${vc_deploy_results}  build  ${vcbuild}

    Log To Console  \nVC deployment completed

    [Return]  ${esxi_deploy_results}  ${vc_deploy_results}

*** Test Cases ***
Deploy VICUI Testbed
    # remove testbed-information if it exists
    ${ti_exists}=  Run Keyword And Return Status  OperatingSystem.Should Exist  testbed-information-%{BUILD_NUMBER}
    Run Keyword If  ${ti_exists}  Remove File  testbed-information-%{BUILD_NUMBER}

    &{testbed_config}=  Create Dictionary

    Set To Dictionary  ${testbed_config}  esx_num  3
    Set To Dictionary  ${testbed_config}  esx_build  5969303
    Set To Dictionary  ${testbed_config}  vc_build  7515524

    ${start_time}=  Get Time  epoch
    ${esxis}  ${vc}=  Prepare VIC UI Testbed  ${testbed_config}
    ${vc_fqdn}=  Get From Dictionary  ${vc}  ip
    
    ${end_time}=  Get Time  epoch
    ${elapsed_time}=  Evaluate  ${end_time} - ${start_time}
    Log To Console  \nTook ${elapsed_time} seconds to deploy testbed VMs\n

    Set Global Variable  ${ESXIs}  ${esxis}
    Set Global Variable  ${VCIP}  ${vc_fqdn}

    ${testbed-information-content}=  Catenate  SEPARATOR=\n
    ...  TEST_VSPHERE_VER=65
    ...  TEST_VC_IP=${vc_fqdn}
    ...  TEST_URL_ARRAY=${vc_fqdn}
    ...  TEST_USERNAME=Administrator@vsphere.local
    ...  TEST_PASSWORD=Admin\!23
    ...  TEST_DATASTORE=datastore1
    ...  EXTERNAL_NETWORK=vm-network
    ...  TEST_TIMEOUT=30m
    ...  GOVC_INSECURE=1
    ...  GOVC_USERNAME=Administrator@vsphere.local
    ...  GOVC_PASSWORD=Admin\!23
    ...  GOVC_URL=${vc_fqdn}\n

    Create File  testbed-information-%{BUILD_NUMBER}  ${testbed-information-content}

Deploy Product OVA
    ${esxi_ova}=  Get From List  ${ESXIs}  2
    ${ip}=  Get From Dictionary  ${esxi_ova}  ip

    Install VIC Product OVA  ${VCIP}  ${ip}  datastore1 (2)
    ${ova_ip}=  Evaluate  '%{OVA_IP_%{BUILD_NUMBER}}'
    Append To File  testbed-information-%{BUILD_NUMBER}  OVA_IP=${ova_ip}\n
    Register VIC Machine Server CA With Windows  ${ova_ip}
    Get Vic Engine Binaries

Deploy VCH
    ${file}=  Evaluate  'testbed-information-%{BUILD_NUMBER}'
    Load Nimbus Testbed Env  ${file}
    ${uname_v}=  Run  uname -v
    ${is_macos}=  Run Keyword And Return Status  Should Contain  ${uname_v}  Darwin
    ${vic-machine-binary}=  Run Keyword If  ${is_macos}  Set Variable  vic-machine-darwin  ELSE  Set Variable  vic-machine-linux
    ${vic-ui-binary}=  Run Keyword If  ${is_macos}  Set Variable  vic-ui-darwin  ELSE  Set Variable  vic-ui-linux
    Set Environment Variable  TEST_RESOURCE  ${TEST_RESOURCE}
    Install VIC Appliance For VIC UI  ui-nightly-run-bin/${vic-machine-binary}  ui-nightly-run-bin/appliance.iso  ui-nightly-run-bin/bootstrap.iso
    Append To File  ${file}  VCH-PARAMS=%{VCH-PARAMS}\n
    Append To File  ${file}  BRIDGE_NETWORK=%{BRIDGE_NETWORK}\n
    Append To File  ${file}  TEST_URL=%{TEST_URL}\n
    Append To File  ${file}  VCH_VM_NAME=%{VCH-NAME}\n
    Append To File  ${file}  VCH-IP=%{VCH-IP}\n
    Append To File  ${file}  VIC-ADMIN=%{VIC-ADMIN}\n
    Append To File  ${file}  GOVC_RESOURCE_POOL=%{GOVC_RESOURCE_POOL}\n
    Append To File  ${file}  GOVC_DATASTORE=%{GOVC_DATASTORE}\n
    Append To File  ${file}  HOST_TYPE=%{HOST_TYPE}\n
    Append To File  ${file}  DATASTORE_TYPE=%{DATASTORE_TYPE}\n
    Append To File  ${file}  vicmachinetls=${vicmachinetls}\n

    ${vc_fingerprint}=  Run  ui-nightly-run-bin/${vic-ui-binary} info --user ${TEST_VC_USERNAME} --password ${TEST_VC_PASSWORD} --target ${TEST_VC_IP} --key com.vmware.vic.noop 2>&1 | grep -o "(thumbprint.*)" | awk -F= '{print $2}' | sed 's/.$//'
    Append To File  ${file}  VC_FINGERPRINT=${vc_fingerprint}\n
    Append To File  ${file}  TEST_THUMBPRINT=${vc_fingerprint}\n
