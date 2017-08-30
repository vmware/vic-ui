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
export const camelCasePattern = new RegExp(/([a-z])([A-Z])/g);
export const supportedCharsPattern = new RegExp(/^[^%|&|*|$|#|@|!|\\|/|:|?|"|<|>|;|'||]+$/);
export const unlimitedPattern = new RegExp(/^[Uu]nlimited$/);
export const numberPattern = new RegExp(/^\d+$/);
export const ipV4Pattern =
  new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);
export const ipV6Pattern = new RegExp(/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/);
export const ipPattern = new RegExp(ipV4Pattern.source + '|' + ipV6Pattern.source);
export const fqdnPattern = /^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/;
export const cidrPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
export const wildcardDomainPattern = /^(\*\.)?([a-z\d][a-z\d-]*[a-z\d]\.)+[a-z]+$/;
