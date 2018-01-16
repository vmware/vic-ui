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
Documentation  Extract VIC UI E2E test results and generate a simple report in text format
Library  XML
Library  OperatingSystem

*** Keywords ***
Process Robot Test Result Summary
  [Arguments]  ${children}
  :FOR  ${child}  IN  @{children}
  \  Run Keyword Unless  '${child.tag}' == 'test'  Continue For Loop
  \  ${name}=  Get Element Attribute  ${child}  name
  \  ${status}=  Get Element  ${child}  status
  \  ${pf}=  Get Element Attribute  ${status}  status
  \  Append To File  ui-test-results.log  \[ ${pf} \]\t${name}\n

Process Robot Test Suite Result Summary
  [Arguments]  ${suite}
  ${name}=  Get Element Attribute  ${suite}  name
  ${suite_status}=  Get Element  ${suite}  status
  ${suite_status_txt}=  Get Element Attribute  ${suite_status}  status
  Append to File  ui-test-results.log   \n** ${name} **\n

*** Test Cases ***
Parse Protractor Test Results
  # variable ${ui-e2e-results-path} should be set before the script is kicked off in the format as follows:
  # robot --variable ui-e2e-results-path:/home/vic/nightly-ui-log/$now/ui-e2e tests/resources/Parse-Vsphere-UI-E2E-Results.robot
  Variable Should Exist  ${ui-e2e-results-path}

  # this script is expected to be run from the root of the vic-ui repository, after a script tests run has completed
  Touch  ui-test-results.log

  # walk each folder from ${ui-e2e-results-path} as root and parse output.xml
  ${dirs}=  List Directories In Directory  ${ui-e2e-results-path}
  :FOR  ${dir}  IN  @{dirs}
  \  ${xmldata}=  Get File  ${ui-e2e-results-path}/${dir}/output.xml
  \  Log To Console  ${ui-e2e-results-path}/${dir}/output.xml
  \  ${robot}=  Parse XML  ${xmldata}
  \  ${suite}=  Get Element  ${robot}  suite
  \  Process Robot Test Suite Result Summary  ${suite}
  \  ${children}=  Get Child Elements  ${suite}
  \  Process Robot Test Result Summary  ${children}  
