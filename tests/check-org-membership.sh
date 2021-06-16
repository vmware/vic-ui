#!/bin/bash
# Copyright 2020-2021 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -ex

echo ${DRONE_COMMIT_AUTHOR}

if [ ! $(curl --silent -H "Authorization: token $GITHUB_AUTOMATION_API_KEY" "https://api.github.com/orgs/vmware/members/${DRONE_COMMIT_AUTHOR}") ]; then
  echo "checked origin membership successfully"
else
  echo "failed to check origin membership"
  exit 1
fi
