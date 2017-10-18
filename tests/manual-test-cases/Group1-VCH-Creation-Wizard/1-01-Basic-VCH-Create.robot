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
Suite Teardown  Close All Browsers

*** Keywords ***

*** Test Cases ***
Test
    :FOR  ${browser}  IN  @{BROWSERS}
    \   Open Browser  https://127.0.0.1  browser=${browser}
    \   Maximize Browser Window
    \   Login To Vsphere UI
    \   Navigate To VCH Creation Wizard
    \   Navigate To VCH Tab
    \   Click New Virtual Container Host Button
    \   Input VCH Name  test-vch
    \   Click Next Button
    \   Select Cluster
    \   Click Next Button
    \   Select Image Datastore  datastore1
    \   Click Next Button
    \   Select Bridge Network  bridge
    \   Select Public Network  vm-network  
    \   Click Next Button
    \   # Security
    \   Click Next Button
    \   # Finish
    \   Click Next Button
    
    Sleep  10
