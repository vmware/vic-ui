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

import { fromBase64, stringToArrayBuffer } from 'pvutils';
import { fromBER } from 'asn1js';
import Certificate from 'pkijs/build/Certificate';
import PrivateKeyInfo from 'pkijs/build/PrivateKeyInfo';

export interface CertificateInfo {
  expires: Date
}

export function parseCertificatePEMFileContent(str: string): CertificateInfo {

  // Remove headers
  str = str.replace(/(-----(BEGIN|END) CERTIFICATE-----|\n)/g, '');

  // Decode Base64 string, convert to an ArrayBuffer and parse raw data
  const asn1 = fromBER(stringToArrayBuffer(fromBase64(str)));

  // Create Certificate model
  const certificate = new Certificate({ schema: asn1.result });

  return {
    expires: certificate.notAfter.value
  }
}

export function parsePrivateKeyPEMFileContent(str: string): boolean {

  // Remove headers
  str = str.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\n)/g, '');

  // Decode Base64 string, convert to an ArrayBuffer and parse raw data
  const asn1 = fromBER(stringToArrayBuffer(fromBase64(str)));

  // Create Private Key model
  const privateKey = new PrivateKeyInfo({ schema: asn1.result });

  return true;
}
