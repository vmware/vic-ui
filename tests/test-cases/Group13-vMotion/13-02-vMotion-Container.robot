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
Documentation  Test 13-02 - vMotion Container
Resource  ../../resources/Util.robot
Suite Setup  Wait Until Keyword Succeeds  10x  10m  Create a VSAN Cluster  vic-vmotion-13-2
Suite Teardown  Run Keyword And Ignore Error  Nimbus Cleanup  ${list}
Test Teardown  Cleanup VIC Appliance On Test Server

*** Test Cases ***
Test
    Set Test Variable  ${user}  %{NIMBUS_USER}
    Set Suite Variable  @{list}  ${user}-vic-vmotion-13-2.vcva-${VC_VERSION}  ${user}-vic-vmotion-13-2.esx.0  ${user}-vic-vmotion-13-2.esx.1  ${user}-vic-vmotion-13-2.esx.2  ${user}-vic-vmotion-13-2.esx.3  ${user}-vic-vmotion-13-2.nfs.0  ${user}-vic-vmotion-13-2.iscsi.0
    
    # pending steps:
    #
    # install OVA and initialize
    # verify OVA components
    # create VCH using wizard UI
    # run docker commands to create containers
    
    ${vmName1}=  Get VM display name  ${container1}
    ${vmName2}=  Get VM display name  ${container2}
    ${vmName3}=  Get VM display name  ${container3}
    
    vMotion A VM  ${vmName1}
    vMotion A VM  ${vmName2}
    vMotion A VM  ${vmName3}
    
    # pending steps:
    #
    # run docker commands to complete container lifecycle
