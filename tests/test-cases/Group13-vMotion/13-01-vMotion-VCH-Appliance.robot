# Copyright 2018 VMware, Inc. All Rights Reserved.
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
Documentation  Test 13-01 - vMotion VCH Appliance
Resource  ../../resources/Util.robot
Suite Setup  Wait Until Keyword Succeeds  10x  10m  Create a VSAN Cluster  vic-vmotion-13-1
Suite Teardown  Run Keyword And Ignore Error  Nimbus Cleanup  ${list}
Test Teardown  Gather Logs From Test Server 

*** Test Cases ***
Step 1-4
    Set Test Variable  ${user}  %{NIMBUS_USER}
    Set Suite Variable  @{list}  ${user}-vic-vmotion-13-1.vcva-${VC_VERSION}  ${user}-vic-vmotion-13-1.esx.0  ${user}-vic-vmotion-13-1.esx.1  ${user}-vic-vmotion-13-1.esx.2  ${user}-vic-vmotion-13-1.esx.3  ${user}-vic-vmotion-13-1.nfs.0  ${user}-vic-vmotion-13-1.iscsi.0
    
    # pending steps:
    #
    # install OVA and initialize
    # verify OVA components
    # create VCH using wizard UI
    # run docker commands
    
    ${host}=  Get VM Host Name  %{VCH-NAME}
    ${status}=  Run Keyword And Return Status  Should Contain  ${host}  ${esx1-ip}
    Run Keyword If  ${status}  Run  govc vm.migrate -host cls/${esx2-ip} %{VCH-NAME}
    Run Keyword Unless  ${status}  Run  govc vm.migrate -host cls/${esx1-ip} %{VCH-NAME}
    
    # pending steps:
    #
    # run docker commands

Step 5-8

    # pending steps:
    #
    # install OVA and initialize
    # verify OVA components
    # create VCH using wizard UI
    # run docker commands to create containers

    ${host}=  Get VM Host Name  %{VCH-NAME}
    ${status}=  Run Keyword And Return Status  Should Contain  ${host}  ${esx1-ip}
    Run Keyword If  ${status}  Run  govc vm.migrate -host cls/${esx2-ip} %{VCH-NAME}
    Run Keyword Unless  ${status}  Run  govc vm.migrate -host cls/${esx1-ip} %{VCH-NAME}
    
    # pending steps:
    #
    # run docker commands to complete container lifecycle
