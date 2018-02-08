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
import { isUploadableFileObject } from './model-checker';

// Tests
describe('Model Checker', () => {
  it('should check if object is uploadable', () => {
      const uploadableObj = {'name': 'test', 'content': 'test'}
      let result = isUploadableFileObject(uploadableObj);
      expect(result).toBeTruthy();

      const nonUploadableObj = {'prop1': 'test', 'prop2': 'test'}
      result = isUploadableFileObject(nonUploadableObj);
      expect(result).toBeFalsy();
  });
});
