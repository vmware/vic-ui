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

import * as objRef from './object-reference';
import { VirtualContainerHost } from '../../vch-view/vch.model';
import { getVchResponseStub } from '../../services/mocks/vch.response';

describe('Object Reference utility functions', () => {
  const mor = {
    objRef: 'urn:vmomi:Datacenter:dc-test:aaaa-bbb-ccc',
    text: 'Test DC',
    nodeTypeId: 'test',
    aliases: [],
    isEmpty: false
  };

  const serversInfo = [{
    name: 'server.vsphere.local',
    serviceGuid: 'aaaa-bbb-ccc',
    serviceUrl: 'https://server.vpshere.local:443/sdk/',
    sessionId: '1',
    thumbprint: 'AA:BB:CC'
  }];

  const vchResponse = getVchResponseStub().results;
  const vchResponseItem = vchResponse[Object.keys(vchResponse)[0]];
  vchResponseItem.id = `aaaa-bbb-ccc/${vchResponseItem.id.split('/')[1]}`;
  const vch = new VirtualContainerHost(vchResponseItem);

  it('should check if MOR ID is returned properly', () => {
    expect(objRef.getMorIdFromObjRef(mor.objRef)).toBe('dc-test');
  });

  it('should return serviceGuid from a DC MOR object', () => {
    expect(objRef.getServerServiceGuidFromObj(mor)).toBe('aaaa-bbb-ccc');
  });

  it('should return thumbprint for a given DC MOR object', () => {
    expect(objRef.getServerThumbprintFromObj(serversInfo, mor)).toBe('AA:BB:CC');
  });

  it('should return hostname for a given DC MOR object', () => {
    expect(objRef.getServerHostnameFromObj(serversInfo, mor)).toBe('server.vsphere.local');
  });

  it('should return ServerInfo object for a given VCH', () => {
    const serverInfo = objRef.getServerInfoByVchObjRef(serversInfo, vch);
    expect(serverInfo.serviceGuid).toBe('aaaa-bbb-ccc');
  })
});
