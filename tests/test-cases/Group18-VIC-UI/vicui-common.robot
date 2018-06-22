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
Library  XML

*** Variables ***
${MACOS_HOST_IP}                      10.25.201.232
${UBUNTU_HOST_IP}                     10.20.121.145
${WINDOWS_HOST_IP}                    10.25.200.93
${BUILD_5310538_IP}                   10.25.200.231
${BUILD_7312210_IP}                   10.25.201.234
${VC_FINGERPRINT_7312210}             FE:31:A9:D1:48:D7:0E:1D:44:75:F8:D9:64:50:8B:B9:30:93:EF:63
${TEST_DATASTORE}                     datastore1
${TEST_DATACENTER}                    /Datacenter
${TEST_RESOURCE}                      /Datacenter/host/Cluster/Resources
${MACOS_HOST_USER}                    browseruser
${MACOS_HOST_PASSWORD}                ca*hc0w
${WINDOWS_HOST_USER}                  Administrator
${WINDOWS_HOST_PASSWORD}              Passw0rd!
${vic_macmini_fileserver_url}         https://${MACOS_HOST_IP}:3443/vsphere-plugins/
${vic_macmini_fileserver_thumbprint}  BE:64:39:8B:BD:98:47:4D:E8:3B:2F:20:A5:21:8B:86:5F:AD:79:CE
${GCP_DOWNLOAD_PATH}                  https://storage.googleapis.com/vic-engine-builds/
${SDK_PACKAGE_ARCHIVE}                vic-ui-sdk.tar.gz
${ENV_VSPHERE_SDK_HOME}               /tmp/sdk/vc_sdk_min
${ENV_FLEX_SDK_HOME}                  /tmp/sdk/flex_sdk_min
${ENV_HTML_SDK_HOME}                  /tmp/sdk/html-client-sdk

*** Keywords ***
Set Fileserver And Thumbprint In Configs
    [Arguments]  ${fake}=${FALSE}  ${root}=../../..
    Run Keyword If  ${fake} == ${FALSE}  Copy File  ${root}/ui-nightly-run-bin/ui/VCSA/configs  ${root}/scripts/VCSA/
    Run Keyword If  ${fake} == ${FALSE}  Copy File  ${root}/ui-nightly-run-bin/ui/vCenterForWindows/configs  ${root}/scripts/vCenterForWindows/
    Return From Keyword If  ${fake} == ${FALSE}

    ${fileserver_url}=  Set Variable  https://256.256.256.256/
    ${fileserver_thumbprint}=  Set Variable  ab:cd:ef
    ${results}=  Replace String Using Regexp  ${configs}  VIC_UI_HOST_URL=.*  VIC_UI_HOST_URL=\"${fileserver_url}\"
    ${results}=  Replace String Using Regexp  ${results}  VIC_UI_HOST_THUMBPRINT=.*  VIC_UI_HOST_THUMBPRINT=\"${fileserver_thumbprint}\"
    Create File  ${UI_INSTALLER_PATH}/configs  ${results}

Load Nimbus Testbed Env
    [Arguments]  ${file}=testbed-information
    Should Exist  ${file}
    ${envs}=  OperatingSystem.Get File  ${file}
    @{envs}=  Split To Lines  ${envs}
    :FOR  ${item}  IN  @{envs}
    \  @{kv}=  Split String  ${item}  =
    \  Set Environment Variable  @{kv}[0]  @{kv}[1]
    \  Set Suite Variable  \$@{kv}[0]  @{kv}[1]
    Set Suite Variable  ${TEST_VC_USERNAME}  %{TEST_USERNAME}
    Set Suite Variable  ${TEST_VC_PASSWORD}  %{TEST_PASSWORD}

Install VIC Appliance For VIC UI
    [Arguments]  ${vic-machine}=ui-nightly-run-bin/vic-machine-linux  ${appliance-iso}=ui-nightly-run-bin/appliance.iso  ${bootstrap-iso}=ui-nightly-run-bin/bootstrap.iso  ${certs}=${false}  ${vol}=default
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
    [Arguments]  ${UI_INSTALLERS_ROOT}=../../../scripts
    ${rc}  ${out}=  Run And Return Rc And Output  ver
    ${is_windows}=  Run Keyword And Return Status  Should Contain  ${out}  Windows
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
    [Arguments]  ${root}=../../..
    ${rc}  ${ver}=  Run And Return Rc And Output  ver
    ${is_windows}=  Run Keyword And Return Status  Should Contain  ${ver}  Windows
    ${vic-ui-binary}=  Run Keyword If  ${is_windows}  Set Variable  ..\\..\\..\\vic-ui-windows  ELSE  Set Variable  ../../../vic-ui-linux
    Set Fileserver And Thumbprint In Configs  ${FALSE}  ${root}
    Run Keyword Unless  ${is_windows}  Append To File  ${UI_INSTALLER_PATH}/configs  BYPASS_PLUGIN_VERIFICATION=1\n
    Run Keyword If  ${is_windows}  Interact With Script  install  -f -i ${TEST_VC_IP} -u ${TEST_VC_USERNAME} -p ${TEST_VC_PASSWORD}  ${EMPTY}  True  ELSE  Install Plugin Successfully  ${TEST_VC_IP}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}  ${TRUE}  None  ${TRUE}
    Run Keyword Unless  ${is_windows}  Reset Configs
    ${output}=  OperatingSystem.GetFile  install.log
    ${passed}=  Run Keyword And Return Status  Should Contain  ${output}  Exited successfully
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
    ${rc}  ${output}=  Run And Return Rc And Output  ${vic-machine} delete --name=${vch-name} --target=%{TEST_URL}${TEST_DATACENTER} --user=%{TEST_USERNAME} --password=%{TEST_PASSWORD} --force=true --compute-resource=${TEST_RESOURCE} --timeout %{TEST_TIMEOUT}
    [Return]  ${rc}  ${output}

Uninstall VCH
    [Arguments]  ${remove_plugin}=${FALSE}
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
    ...  /Users/browseruser/Desktop/vic/tests/test-cases/Group18-VIC-UI/testbed-information
    ...  /Users/browseruser/Desktop/vic/tests/test-cases/Group18-VIC-UI/VCH-0*
    ...  /Users/browseruser/Desktop/vic/tests/test-cases/Group18-VIC-UI/18-*.zip
    ...  /tmp/vic-ui-e2e-scratch

    ${output}=  Run  rm -rvf ${files_to_remove} 2>&1
    Log  Cleaning up macOS testbed...\n${output}

Cleanup Windows Testbed
    ${files_to_remove}=  Catenate
    ...  ~/vic/tests/test-cases/Group18-VIC-UI/testbed-information
    ...  ~/vic/tests/test-cases/Group18-VIC-UI/VCH-0*
    ...  ~/vic/tests/test-cases/Group18-VIC-UI/18-*.zip
    ...  /tmp/vic-ui-e2e-scratch

    ${output}=  Run  rm -rf ${files_to_remove} 2>&1
    Log  Cleaning up Windows testbed...\n${output}

Run GOVC
    [Arguments]  ${cmd_options}
    ${rc}  ${output}=  Run And Return Rc And Output  govc ${cmd_options}
    Log  ${output}
    Should Be Equal As Integers  ${rc}  0
    [Return]  ${rc}

Install VIC Product OVA
    [Arguments]  ${target-vc-ip}  ${ova-esx-host-ip}  ${ova-esx-datastore}
    ${buildnum}=  Set Variable  %{BUILD_NUMBER}
    Variable Should Exist  ${ova_url}
    ${ova-name}=  Fetch From Right  ${ova_url}  /
    Log  OVA filename is: ${ova-name}
    Log  Target vSphere is located at: ${target-vc-ip}

    # set ova name global
    Set Global Variable  ${ova_name}  ${ova-name}

    # set the local path to ova global
    Set Global Variable  ${ova_local_path}  /vic/${ova-name}

    Set Environment Variable  GOVC_URL  ${target-vc-ip}
    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Bl*ckwalnut0
    ${rc}  ${ova_ip}=  Run And Return Rc And Output  govc vm.ip -dc=Datacenter ${ova-name}
    ${ova_found}=  Run Keyword And Return Status  Should Be True  ${rc} == 0

    # if ova is already found in the target VC, get IP and break out of the keyword
    Run Keyword If  ${ova_found}  Set Environment Variable  OVA_IP_${buildnum}  ${ova_ip}
    Return From Keyword If  ${ova_found}

    # check if OVA file is locally available already and download if there's none
    ${ova_exists}=  Run Keyword And Return Status  OperatingSystem.File Should Exist  ${ova_local_path}
    Run Keyword If  ${ova_exists}  Log To Console  OVA file is already found at ${ova_local_path}
    Run Keyword Unless  ${ova_exists}  Download VIC OVA  ${ova_url}  ${ova_local_path}

    Log To Console  \nInstalling VIC appliance...
    Log To Console  \novftool --datastore='${ova-esx-datastore}' --noSSLVerify --acceptAllEulas --name=${ova-name} --diskMode=thin --powerOn --X:waitForIp --X:injectOvfEnv --X:enableHiddenProperties --prop:appliance.root_pwd='Bl*ckwalnut0' --prop:appliance.permit_root_login=True --net:"Network"="VM Network" ${ova_local_path} 'vi://administrator@vsphere.local:Bl*ckwalnut0@${target-vc-ip}${TEST_DATACENTER}/host/${ova-esx-host-ip}'\n
    ${output}=  Run  ovftool --datastore='${ova-esx-datastore}' --noSSLVerify --acceptAllEulas --name=${ova-name} --diskMode=thin --powerOn --X:waitForIp --X:injectOvfEnv --X:enableHiddenProperties --prop:appliance.root_pwd='Bl*ckwalnut0' --prop:appliance.permit_root_login=True --net:"Network"="VM Network" ${ova_local_path} 'vi://administrator@vsphere.local:Bl*ckwalnut0@${target-vc-ip}${TEST_DATACENTER}/host/${ova-esx-host-ip}'
    Should Contain  ${output}  Completed successfully
    Should Contain  ${output}  Received IP address:

    ${output}=  Split To Lines  ${output}
    :FOR  ${line}  IN  @{output}
    \   ${status}=  Run Keyword And Return Status  Should Contain  ${line}  Received IP address:
    \   ${ip}=  Run Keyword If  ${status}  Fetch From Right  ${line}  ${SPACE}
    \   Run Keyword If  ${status}  Set Environment Variable  OVA_IP_${buildnum}  ${ip}

    Log To Console  \nWaiting for Getting Started Page to Come Up...
    :FOR  ${i}  IN RANGE  24
    \   ${rc}  ${out}=  Run And Return Rc And Output  curl -k -w "\%{http_code}\\n" --header "Content-Type: application/json" -X POST --data '{"target":"${target-vc-ip}:443","user":"administrator@vsphere.local","password":"Bl*ckwalnut0"}' https://%{OVA_IP_${buildnum}}:9443/register 2>/dev/null
    \   Exit For Loop If  '200' in '''${out}'''
    \   Sleep  5s
    Log To Console  ${rc}
    Log To Console  ${out}
    Should Contain  ${out}  200

    Log  %{OVA_IP_${buildnum}}

Download VIC OVA
    [Arguments]  ${url}  ${local_path}
    ${rc}  ${out}=  Run And Return Rc And Output  curl -sLk ${url} -o ${local_path}
    Log  ${out}
    Should Be True  ${rc} == 0
    OperatingSystem.File Should Exist  ${local_path}
    Log To Console  OVA successfully downloaded

Cleanup VIC Product OVA
    [Arguments]  ${target-vc-ip}  ${ova-esx-datastore}  ${ova_target_vm_name}
    Log To Console  \nCleaning up VIC appliance...
    ${rc}=  Wait Until Keyword Succeeds  10x  5s  Run GOVC  vm.destroy ${ova_target_vm_name}
    Run Keyword And Ignore Error  Run GOVC  datastore.rm "/${ova-esx-datastore}/vm/${ova_target_vm_name}"
    Run Keyword if  ${rc} == 0  Log To Console  \nVIC Product OVA deployment ${ova_target_vm_name} is cleaned up on test server ${target-vc-ip}

Get Vic Engine Binaries
    Log To Console  \nDownloading VIC engine for build # %{BUILD_NUMBER}...
    ${target_dir}=  Set Variable  bin
    ${results}=  Wait Until Keyword Succeeds  5x  15 sec  Download VIC Engine Tarball From OVA  /tmp/vic.tar.gz
    Should Be True  ${results}
    Prepare VIC Engine Binaries

Download VIC Engine Tarball From OVA
    [Arguments]  ${filename}
    ${rc}  ${out}=  Run And Return Rc And Output  curl -sLk https://%{OVA_IP_%{BUILD_NUMBER}}:9443/files
    Should Be Equal As Integers  ${rc}  0
    ${ret}  ${tarball_file}=  Should Match Regexp  ${out}  (vic_\\d+\.tar\.gz|vic_v\\d\.\\d\.\\d\.tar\.gz|vic_v\\d\.\\d\.\\d\-rc\\d\.tar\.gz|vic_\\d\.\\d\.\\d\-dev\.tar\.gz)
    Should Not Be Empty  ${tarball_file}
    ${rc}=  Run And Return Rc  wget --no-check-certificate https://%{OVA_IP_%{BUILD_NUMBER}}:9443/files/${tarball_file} -O ${filename}
    Should Be Equal As Integers  ${rc}  0
    OperatingSystem.File Should Exist  ${filename}
    Set Suite Variable  ${buildNumber}  ${tarball_file}
    Set Suite Variable  ${LATEST_VIC_ENGINE_TARBALL}  ${tarball_file}
    [Return]  ${rc} == 0

Prepare VIC Engine Binaries
    Log  Extracting binary files...
    ${rc1}=  Run And Return Rc  mkdir -p ui-nightly-run-bin
    ${rc2}=  Run And Return Rc  tar xvzf /tmp/vic.tar.gz -C ui-nightly-run-bin --strip 1
    # ${rc3}=  Run And Return Rc  tar xvzf ${LATEST_VIC_UI_TARBALL} -C ui-nightly-run-bin --strip 1
    Should Be Equal As Integers  ${rc1}  0
    Should Be Equal As Integers  ${rc2}  0
    # Should Be Equal As Integers  ${rc3}  0
    # copy vic-ui-linux and plugin binaries to where test scripts will access them
    Run  cp -rf ui-nightly-run-bin/vic-ui-* ./
    Run  cp -rf ui-nightly-run-bin/ui/* scripts/

Open SSH Connection
  [Arguments]  ${host}  ${user}  ${pass}  ${port}=22  ${retry}=4 minutes  ${retry_interval}=12 seconds
  Open Connection  ${host}  port=${port}
  Wait until keyword succeeds  ${retry}  ${retry_interval}  Login  ${user}  ${pass}

Register Root CA Certificate With Windows
    [Arguments]  ${cert_file}
    ${basename}=  Run  basename ${cert_file}
    Open SSH Connection  ${WINDOWS_HOST_IP}  ${WINDOWS_HOST_USER}  ${WINDOWS_HOST_PASSWORD}
    SSHLibrary.Put File  ${cert_file}  /cygdrive/c/certs/${basename}

    # register ca
    Log To Console  Registering Root CA...
    ${stdout}  ${rc}=  Execute Command  powershell -Command 'Import-Certificate -FilePath "C:\\certs\\${basename}" -CertStoreLocation "Cert:\\LocalMachine\\Root\\" -Verbose' 2>&1  return_rc=True
    Should Be Equal As Integers  ${rc}  0
    Log To Console  ${stdout}

    Close Connection

Register VIC Machine Server CA With Windows
    [Arguments]  ${ova_ip}
    Log To Console  \nDownloading Root CA for VIC Machine server...
    Open SSH Connection  ${ova_ip}  root  Bl*ckwalnut0
    ${out}  ${rc}=  Execute Command  docker cp vic-machine-server:/certs/ca.crt /tmp/vic-machine-server-ca.crt  return_rc=True
    SSHLibrary.Get File  /tmp/vic-machine-server-ca.crt  /tmp/
    Close Connection

    # delete previously registered CA
    Delete VIC Machine Server CA

    OperatingSystem.File Should Exist  /tmp/vic-machine-server-ca.crt
    Register Root CA Certificate With Windows  /tmp/vic-machine-server-ca.crt

Delete VIC Machine Server CA
    Open SSH Connection  ${WINDOWS_HOST_IP}  ${WINDOWS_HOST_USER}  ${WINDOWS_HOST_PASSWORD}
    Log To Console  Deleting VIC Machine Server Root CA...
    ${stdout}  ${rc}=  Execute Command  powershell -Command 'Get-ChildItem -Path cert:\\LocalMachine\\Root | Where-Object { \$_.subject -Match "OU=Containers on vSphere" } | Remove-Item' 2>&1  return_rc=True
    Log To Console  ${stdout}
    Should Be Equal As Integers  ${rc}  0
    Close Connection

Delete VC Root CA
    Open SSH Connection  ${WINDOWS_HOST_IP}  ${WINDOWS_HOST_USER}  ${WINDOWS_HOST_PASSWORD}
    Log To Console  Deleting VC Root CA...
    ${stdout}  ${rc}=  Execute Command  powershell -Command 'Get-ChildItem -Path cert:\\LocalMachine\\Root | Where-Object { \$_.subject -Match "OU=VMware Engineering.*" } | Remove-Item' 2>&1  return_rc=True
    Log To Console  ${stdout}
    Should Be Equal As Integers  ${rc}  0
    Close Connection

Register VC CA Cert With Windows
    [Arguments]  ${vc_fqdn}
    Log To Console  \nDownloading Root CA from VC...
    ${file}=  Evaluate  '/tmp/vc_ca_%{BUILD_NUMBER}.zip'
    ${rc}=  Run And Return Rc  curl -sLk -o ${file} https://${vc_fqdn}/certs/download.zip
    Should Be Equal As Integers  ${rc}  0
    Run  unzip -od /tmp/ ${file}
    ${rc}  ${out}=  Run And Return Rc And Output  find /tmp/certs/win/*.crt -exec mv {} /tmp/certs/win/vc_ca_cert.crt \\;
    Should Be Equal As Integers  ${rc}  0

    # delete previously registered CA
    Delete VC Root CA

    Register Root CA Certificate With Windows  /tmp/certs/win/vc_ca_cert.crt

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
    Open SSH Connection  ${vc_fqdn}  root  vmware  retry_interval=30 sec
    ${stdout}  ${rc}=  Execute Command  /usr/lib/vmware-vmafd/bin/dir-cli password change --account administrator@vsphere.local --current 'Admin!23' --new 'Bl*ckwalnut0' 2>&1  return_rc=True
    Should Be Equal As Integers  ${rc}  0
    Log To Console  ${stdout}
    Close Connection

    Set Environment Variable  GOVC_INSECURE  1
    Set Environment Variable  GOVC_USERNAME  Administrator@vsphere.local
    Set Environment Variable  GOVC_PASSWORD  Bl*ckwalnut0
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
    ${out}=  Run  govc dvs.create -dc=Datacenter -product-version 5.5.0 test-ds
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

Deploy ESXi On Nimbus And Get Info
    [Arguments]  ${name}  ${build}
    ${pid}=  Deploy ESXi Server On Nimbus Async  ${name}  ${build}
    ${results}=  Wait For Process  ${pid}
    Should Contain  ${results.stdout}  To manage this VM use

    Open SSH Connection  %{NIMBUS_GW}  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  retry_interval=30 sec
    ${govc_username_set}=  Run Keyword And Return Status  Environment Variable Should Be Set  GOVC_USERNAME
    ${govc_password_set}=  Run Keyword And Return Status  Environment Variable Should Be Set  GOVC_PASSWORD
    Run Keyword If  ${govc_username_set}  Remove Environment Variable  GOVC_USERNAME
    Run Keyword If  ${govc_password_set}  Remove Environment Variable  GOVC_PASSWORD

    Set Environment Variable  GOVC_INSECURE  1
    
    ${esxi_ip}=  Get IP  ${name}
    Close Connection
    Set Environment Variable  GOVC_URL  root:@${esxi_ip}
    ${out}=  Run  govc host.account.update -id root -password e2eFunctionalTest
    Should Be Empty  ${out}
    Log To Console  Successfully deployed %{NIMBUS_USER}-${name}. IP: ${esxi_ip}
    [Return]  %{NIMBUS_USER}-${name}  ${esxi_ip}

Destroy Testbed
    [Arguments]  ${name}
    Log To Console  Destroying VM(s) ${name}
    ${out}=  Kill Nimbus Server  %{NIMBUS_USER}  %{NIMBUS_PASSWORD}  ${name}
    Log  ${out}
