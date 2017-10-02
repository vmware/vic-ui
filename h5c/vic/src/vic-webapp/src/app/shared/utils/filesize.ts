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

const KILOBYTE = 1024;
const MEGABYTE = Math.pow(KILOBYTE, 2);
const GIGABYTE = Math.pow(KILOBYTE, 3);
const TERABYTE = Math.pow(KILOBYTE, 4);
const B_AFFIX = 'B';
const KB_AFFIX = 'KB';
const MB_AFFIX = 'MB';
const GB_AFFIX = 'GB';
const TB_AFFIX = 'TB';
const DECIMALS = 2;

function byteToLegibleUnit(num: number): string {
    const results = num * 1;
    if (results >= TERABYTE) {
        return `${(results / TERABYTE).toFixed(DECIMALS)} ${TB_AFFIX}`;
    } else if (results >= GIGABYTE) {
        return `${(results / GIGABYTE).toFixed(DECIMALS)} ${GB_AFFIX}`;
    } else if (results >= MEGABYTE) {
        return `${(results / MEGABYTE).toFixed(DECIMALS)} ${MB_AFFIX}`;
    } else if (results >= KILOBYTE) {
        return `${(results / KILOBYTE).toFixed(DECIMALS)} ${KB_AFFIX}`;
    } else {
        return `${results} ${B_AFFIX}`;
    }
}

export { byteToLegibleUnit }
