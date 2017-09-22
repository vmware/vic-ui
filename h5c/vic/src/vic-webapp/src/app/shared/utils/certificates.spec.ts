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

import { parseCertificatePEMFileContent, parsePrivateKeyPEMFileContent} from './certificates';

describe('Certificates and private keys parsing', () => {
  const certificateFixture = `-----BEGIN CERTIFICATE-----
MIIDvDCCAyWgAwIBAgIJAMbHBAm8IlugMA0GCSqGSIb3DQEBBQUAMIGbMQswCQYD
VQQGEwJKUDEOMAwGA1UECBMFVG9reW8xEDAOBgNVBAcTB0NodW8ta3UxETAPBgNV
BAoTCEZyYW5rNEREMRgwFgYDVQQLEw9XZWJDZXJ0IFN1cHBvcnQxGDAWBgNVBAMT
D0ZyYW5rNEREIFdlYiBDQTEjMCEGCSqGSIb3DQEJARYUc3VwcG9ydEBmcmFuazRk
ZC5jb20wHhcNMDcxMjA3MTAyMTQ2WhcNMTcxMjA0MTAyMTQ2WjCBmzELMAkGA1UE
BhMCSlAxDjAMBgNVBAgTBVRva3lvMRAwDgYDVQQHEwdDaHVvLWt1MREwDwYDVQQK
EwhGcmFuazRERDEYMBYGA1UECxMPV2ViQ2VydCBTdXBwb3J0MRgwFgYDVQQDEw9G
cmFuazRERCBXZWIgQ0ExIzAhBgkqhkiG9w0BCQEWFHN1cHBvcnRAZnJhbms0ZGQu
Y29tMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7r7yPJdXmDL2/+L2iogxQ
rLML+10EwAY9lJRCHGPqSJ8if7teqnXgFr6MAEiCwTcLvk4h1UxLrDXmxooegNg1
zx/OODbcc++SfFCGmflwj/wjLpYRwPgux7/QIgrUqzsj2HtdRFd+WPVD4AOtY9gn
xjNXFpVe1zmgAm/UFLdMewIDAQABo4IBBDCCAQAwHQYDVR0OBBYEFGLze+0G1LHV
nH9I5e/FyRVh/dkRMIHQBgNVHSMEgcgwgcWAFGLze+0G1LHVnH9I5e/FyRVh/dkR
oYGhpIGeMIGbMQswCQYDVQQGEwJKUDEOMAwGA1UECBMFVG9reW8xEDAOBgNVBAcT
B0NodW8ta3UxETAPBgNVBAoTCEZyYW5rNEREMRgwFgYDVQQLEw9XZWJDZXJ0IFN1
cHBvcnQxGDAWBgNVBAMTD0ZyYW5rNEREIFdlYiBDQTEjMCEGCSqGSIb3DQEJARYU
c3VwcG9ydEBmcmFuazRkZC5jb22CCQDGxwQJvCJboDAMBgNVHRMEBTADAQH/MA0G
CSqGSIb3DQEBBQUAA4GBALosLpHduFOY30wKS2WQ32RzRgh0ZWNlLXWHkQYmzTHN
okwYLy0wGfIqzD1ovLMjDuPMC3MBmQPg8zhd+BY2sgRhgdEBmYWTiw71eZLLmI/e
dQbu1z6rOXJb8EegubJNkYTcuxsKLijIfJDnK2noqPt03puJEsBxosN14XPEhIEO
-----END CERTIFICATE-----`;

    const privateKeyFixture = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0e88InuZnU8nu
q98c1iXn8Mrv079mBBhQq87nwThO8d/ADUp+eFbsuPbTkDNENqL30GrMsdhppjvM
mhpTfSMXDD54iHxjx9RI5x72KT3C99qSje66bahCNo4rXKmyuzm/Oq92Ig3eD6hY
SamnlsMEbcgSjVVe7hjD/+32PnekNgobL9eIXFmXCjliQ+9FQe3TmisbzHCXckmo
L2+g7BarHDKdYmmxpSySrUI718rvtNUwbI+Y9LQmHUsOsTrgrXM9P04+cgTTC4KV
JCpLbuZzYsCTOvMhevzQwtPtX7kWz0wvM3EaXpkHEyR8A86aGRljV78Xr63f1QaO
WiM3GqFtAgMBAAECggEACDS74lC1OZv36bPjUlCTSyMp2vMl9+m2QE67etKQcJhz
O6xvB2aJzzwOrupWxmJ0kO9nN7TbWdxeyiv0h/i/1G+wVHMiMrg2ePUXNYqE/h0e
UT0GTnAnbxFDcAnHxnJYSw9MRIMCXecY2KDKx62lYslqCBvodoc9VYYIqAJJlsvx
eifF380VCmq3u8fPqNz7if3Y6eprolzk2ab7HsrXYojHko/YxY+TSJEdMzcYrukr
q3owSbeK4aGFSY8gIIWUzF+yUym3txWZmWe9nrw8SGLvRgsoitldDeAov9Ky5lAR
iY8gyMkbC/bKmknHdVnQcvcAEyAwtVWyLyCjI5sFqQKBgQD2MAGCRr82A6ko6GGS
3osLkP4BcdN4ZzgLg/fgns6qn/S/QO7FGK9NKb2oVUr4T1LSep4noGdHK8oiUsXy
4sT6jI+c4WxPg8q93wXDSDXyxEb8Wm952Qgo3BtL+MOixL29ktNuBKaLyZ92mVVA
EEGAqHzhlGxQpvmAp2WFgaWn+QKBgQC7rWNLxytyRbZ9/oJLKR+01fYDwOz1dTEj
nJ4Smpe/Td+CtdR1wuC1XVixbxrulzPjxMnv9U1j8Sl6C0n2jg14+SeRVG1k/2ma
uIm/stdwVWr2+hsAJQn1KX6Eq7z+iwgkFsQHTVB0anZ8tvvQh7bAgVciqX5FnYNa
W/wWzd0qFQKBgQDAEW/77aocP/rnuXT2mr0sRvCEvANaOl1VTp5DFmLyZ10RIV2n
U7zgnKIlBHY7B9f78kIVdGVe92D6Kk3ZUuaO+r7IjG5uEspIHAlo85tzTYJ8Oyoh
jBt7lU2OlgQ7pvbJQhXGDcbJ5IGOi84g7w3LjKfxblSbD8o0f2ULJbzSMQKBgF4V
X8/fOsKAfCnRatPu+7wV/syG7MNoSogFvaCp6yS2DzRhnu6iETAaaZoZjrDJD/RA
9NLccD2H6jkKa7u0HsDkdpd+cZDOEczEchmtuB7SU1sYqmx6JPHIKWqtBYO9gwlE
eGUItyqFLHz85mP1hQIgVORFf826Vtz3e/qanSK5AoGBAO4sjsXjdxHIV4i0jzug
liJZWwZ0i3q7vPXbTXPkaZKly9pEypH2qnULocyMHYQMIg2c6VxnqhcTJuMwNgB4
qkmHyA6iBG4gTt+2AHR8sxlPJxcD+LG2JvRursK/sOsI2GJggEzLDLSsJ/b60/Kx
BbNdSRpHPUXGX4jDxtQRRjs5
-----END PRIVATE KEY-----`;

  it('should parse a valid certificate PEM file text content', () => {
    const certificate = parseCertificatePEMFileContent(certificateFixture);
    expect(certificate).toEqual(jasmine.objectContaining({
      expires: new Date('Mon Dec 04 2017 07:21:46 GMT-0300 (-03)')
    }));
  });

  it('should parse a valid private key PEM file text content', () => {
    const privateKey = parsePrivateKeyPEMFileContent(privateKeyFixture);
    expect(privateKey).toBe(true);
  });
});
