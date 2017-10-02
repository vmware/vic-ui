/*
 Copyright 2017 VMware, Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

/* get client operating system */

export function getClientOS(): string {
  let clientOS = '';
  if (navigator.appVersion.indexOf('Win') !== -1) {
    clientOS = 'windows';
  };
  if (navigator.appVersion.indexOf('Mac') !== -1) {
    clientOS = 'darwin';
  };
  if (navigator.appVersion.indexOf('Linux') !== -1) {
    clientOS = 'linux';
  };
  return clientOS;
}
