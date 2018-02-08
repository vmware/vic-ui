/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

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

// Internal imports
import { byteToLegibleUnit } from './filesize';

// Tests
describe('Filesize', () => {
  it('should return bytes to legible units', () => {
    const BYTES = 100;
    const KILOBYTE = 1024;
    const MEGABYTE = Math.pow(KILOBYTE, 2);
    const GIGABYTE = Math.pow(KILOBYTE, 3);
    const TERABYTE = Math.pow(KILOBYTE, 4);

    let result = byteToLegibleUnit(BYTES);
    expect(result).toContain('B');

    result = byteToLegibleUnit(KILOBYTE);
    expect(result).toContain('KB');

    result = byteToLegibleUnit(MEGABYTE);
    expect(result).toContain('MB');

    result = byteToLegibleUnit(GIGABYTE);
    expect(result).toContain('GB');

    result = byteToLegibleUnit(TERABYTE);
    expect(result).toContain('TB');
  });
});
