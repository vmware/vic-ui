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
Documentation  This resource contains any keywords dealing with web based operations being performed within the VCH Creation Wizard

*** Keywords ***
Input VCH Name
    [Arguments]  ${name}
    Wait Until Element Is Visible And Enabled  nameInput
    Input Text  nameInput  ${name}

Click Next Button
    Wait Until Element Is Visible And Enabled  css=button.btn.clr-wizard-btn.btn-primary
    Click Button  css=button.btn.clr-wizard-btn.btn-primary

Select Cluster
    Wait Until Element Is Visible And Enabled  css=clr-icon[shape='cluster']
    Click Element  css=clr-icon[shape='cluster']

Select Image Datastore
    [Arguments]  ${datastore}
    Wait Until Element Is Visible And Enabled  image-store-selector
    Select From List By Value  image-store-selector  ${datastore}

Select Bridge Network
    [Arguments]  ${network}
    Wait Until Element Is Visible And Enabled  bridge-network-selector
    Select From List By Value  bridge-network-selector  ${network}

Select Public Network
    [Arguments]  ${network}
    Wait Until Element Is Visible And Enabled  public-network-selector
    Select From List By Value  public-network-selector  ${network}