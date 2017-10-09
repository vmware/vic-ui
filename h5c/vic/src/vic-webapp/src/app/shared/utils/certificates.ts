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
import InternalPrivateKeyInfo from 'pkijs/build/PrivateKeyInfo';

export interface CertificateInfo {
  expires: Date
}

export interface PrivateKeyInfo {
  algorithm: any
}

const algorithmsMap = {
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.113549.2.1': 'MD2',
  '1.2.840.113549.1.1.2': 'MD2 with RSA',
  '1.2.840.113549.2.5': 'MD5',
  '1.2.840.113549.1.1.4': 'MD5 with RSA',
  '1.3.14.3.2.26': 'SHA1',
  '1.2.840.10040.4.3': 'SHA1 with DSA',
  '1.2.840.10045.4.1': 'SHA1 with ECDSA',
  '1.2.840.113549.1.1.5': 'SHA1 with RSA',
  '2.16.840.1.101.3.4.2.4': 'SHA224',
  '1.2.840.113549.1.1.14': 'SHA224 with RSA',
  '2.16.840.1.101.3.4.2.1': 'SHA256',
  '1.2.840.113549.1.1.11': 'SHA256 with RSA',
  '2.16.840.1.101.3.4.2.2': 'SHA384',
  '1.2.840.113549.1.1.12': 'SHA384 with RSA',
  '2.16.840.1.101.3.4.2.3': 'SHA512',
  '1.2.840.113549.1.1.13': 'SHA512 with RSA'
};

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

export function parsePrivateKeyPEMFileContent(str: string): PrivateKeyInfo {

  // Remove headers
  str = str.replace(/(-----(BEGIN|END) PRIVATE KEY-----|\n)/g, '');

  // Decode Base64 string, convert to an ArrayBuffer and parse raw data
  const asn1 = fromBER(stringToArrayBuffer(fromBase64(str)));

  // Create Private Key model
  const privateKey = new InternalPrivateKeyInfo({ schema: asn1.result });

  return {
    algorithm: algorithmsMap[privateKey.privateKeyAlgorithm.algorithmId]
  };
}
