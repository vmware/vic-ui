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
Documentation  Test 2-01 - VIC Upgrade
Resource  ../../resources/Util.robot
Resource  ../Group18-VIC-UI/vicui-common.robot
Suite Setup  Prepare Testbed For Protractor Tests
Suite Teardown  Cleanup Testbed After Protractor Test Completes

*** Variables ***
${OVA_UTIL_ROBOT}  https://github.com/vmware/vic-product/raw/master/tests/resources/OVA-Util.robot

*** Keywords ***
Cleanup Testbed After Protractor Test Completes
    # Revert some modified local files
    Run  git reset --hard HEAD 2>&1

    # Delete binaries
    Run  rm -rf vic*.tar.gz ui-nightly-run-bin
    Run  rm -rf scripts/plugin-packages/com.vmware.vic-v1*
    Run  rm -rf scripts/vsphere-client-serenity/com.vmware.vic.ui-v1*

    # delete plugins from VC
    Cleanup Plugins From VC  ${TEST_VC_IP}  %{VC_FINGERPRINT}  ${TEST_VC_USERNAME}  ${TEST_VC_PASSWORD}

*** Test Cases ***
# TBD
# [ Windows 10 - Chrome ]
# [ Windows 10 - IE11 ]
# [ MacOS - Chrome ]
# [ MacOS - Firefox ]
# [ Windows 10 - Chrome ]
# [ Windows 10 - Firefox ]
# [ Windows 10 - IE11 ]
# [ MacOS - Chrome ]
# [ MacOS - Firefox ]
