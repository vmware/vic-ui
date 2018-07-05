import {ComputeResource, ResourceBasicInfo} from '../../interfaces/compute.resource';

export const serverInfoServiceGui = 'd7c361cc-0a46-441e-8e21-ac22debf7003';

//  DC
export const dcResourceBasicInfos: ResourceBasicInfo[] = [
  {
    serverGuid: serverInfoServiceGui,
    value: 'datacenter-2',
    type: 'Datacenter',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'datacenter-52',
    type: 'Datacenter',
  }
];
export const dcComputeResources: ComputeResource[] = [
  {
    ...dcResourceBasicInfos[0],
    text: 'Datacenter',
    name: 'Datacenter',
    parent: null,
    resourcePool: null,
    hasChildren: true,
    objRef: `urn:vmomi:${dcResourceBasicInfos[0].type}:${dcResourceBasicInfos[0].value}:${dcResourceBasicInfos[0].serverGuid}`,
    nodeTypeId: dcResourceBasicInfos[0].type,
    isEmpty: null,
    aliases: [
      'urn:vmomi:Folder:group-h4:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-v3:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-s5:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-n6:d7c361cc-0a46-441e-8e21-ac22debf7003'
    ]
  },
  {
    ...dcResourceBasicInfos[1],
    text: 'Datacenter 1',
    name: 'Datacenter 1',
    parent: null,
    resourcePool: null,
    hasChildren: true,
    objRef: `urn:vmomi:${dcResourceBasicInfos[1].type}:${dcResourceBasicInfos[1].value}:${dcResourceBasicInfos[1].serverGuid}`,
    nodeTypeId: dcResourceBasicInfos[1].type,
    isEmpty: null,
    aliases: [
      'urn:vmomi:Folder:group-h54:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-v53:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-s55:d7c361cc-0a46-441e-8e21-ac22debf7003',
      'urn:vmomi:Folder:group-n56:d7c361cc-0a46-441e-8e21-ac22debf7003'
    ]
  }
];
export const datacenter: ComputeResource = dcComputeResources[0];
export const datacenter1: ComputeResource = dcComputeResources[1];

// Host
export const hostResourceBasicInfos: ResourceBasicInfo[] = [
  {
    serverGuid: serverInfoServiceGui,
    value: 'host-94',
    type: 'HostSystem',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'host-20',
    type: 'HostSystem',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'host-9',
    type: 'HostSystem',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'host-101',
    type: 'HostSystem',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'host-276',
    type: 'HostSystem'
  }
];
export const hostComputeResources: ComputeResource[] = [
  {
    ...hostResourceBasicInfos[0],
    name: '10.192.109.234',
    parent: {
      serverGuid: serverInfoServiceGui,
      value: 'domain-c23',
      type: 'ClusterComputeResource',
    },
    resourcePool: null,
    text: '10.192.109.234',
    hasChildren: true,
    objRef: `urn:vmomi:${hostResourceBasicInfos[0].type}:${hostResourceBasicInfos[0].value}:${hostResourceBasicInfos[0].serverGuid}`,
    nodeTypeId: hostResourceBasicInfos[0].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-93:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  },
  {
    ...hostResourceBasicInfos[1],
    name: '10.161.251.202',
    parent: null,
    resourcePool: null,
    text: '10.161.251.202',
    hasChildren: false,
    objRef: `urn:vmomi:${hostResourceBasicInfos[1].type}:${hostResourceBasicInfos[1].value}:${hostResourceBasicInfos[1].serverGuid}`,
    nodeTypeId: hostResourceBasicInfos[1].type,
    aliases: null
  },
  {
    ...hostResourceBasicInfos[2],
    name: '10.162.17.176',
    parent: null,
    resourcePool: null,
    text: '10.162.17.176',
    hasChildren: false,
    objRef: `urn:vmomi:${hostResourceBasicInfos[2].type}:${hostResourceBasicInfos[2].value}:${hostResourceBasicInfos[2].serverGuid}`,
    nodeTypeId: hostResourceBasicInfos[2].type,
    aliases: null
  },
  {
    ...hostResourceBasicInfos[3],
    name: '10.192.115.9',
    parent: null,
    resourcePool: null,
    text: '10.192.115.9',
    hasChildren: false,
    objRef: `urn:vmomi:${hostResourceBasicInfos[3].type}:${hostResourceBasicInfos[3].value}:${hostResourceBasicInfos[3].serverGuid}`,
    nodeTypeId: hostResourceBasicInfos[3].type,
    aliases: null
  },
  {
    ...hostResourceBasicInfos[4],
    name: '10.192.115.91',
    parent: null,
    resourcePool: null,
    text: '10.192.115.91',
    hasChildren: false,
    objRef: `urn:vmomi:${hostResourceBasicInfos[4].type}:${hostResourceBasicInfos[4].value}:${hostResourceBasicInfos[4].serverGuid}`,
    nodeTypeId: hostResourceBasicInfos[4].type,
    aliases: null
  }
];

// Cluster
export const clusterResourceBasicInfos: ResourceBasicInfo[] = [
  {
    serverGuid: serverInfoServiceGui,
    value: 'domain-c23',
    type: 'ClusterComputeResource',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'domain-c98',
    type: 'ClusterComputeResource',
  }
];
export const clusterComputeResources: ComputeResource[] = [
  {
    ...clusterResourceBasicInfos[0],
    name: 'New Cluster',
    parent: null,
    resourcePool: null,
    text: 'New Cluster',
    hasChildren: true,
    objRef:
      `urn:vmomi:${clusterResourceBasicInfos[0].type}:${clusterResourceBasicInfos[0].value}:${clusterResourceBasicInfos[0].serverGuid}`,
    nodeTypeId: clusterResourceBasicInfos[0].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  },
  {
    ...clusterResourceBasicInfos[1],
    name: 'New Cluster 1',
    parent: null,
    resourcePool: null,
    text: 'New Cluster 1',
    hasChildren: true,
    objRef:
      `urn:vmomi:${clusterResourceBasicInfos[1].type}:${clusterResourceBasicInfos[1].value}:${clusterResourceBasicInfos[1].serverGuid}`,
    nodeTypeId: clusterResourceBasicInfos[1].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-99:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-52:d7c361cc-0a46-441e-8e21-ac22debf7003'
  }
];
export const mockedDcClustersAndStandAloneHostsList: ComputeResource[] = [
  clusterComputeResources[0],
  hostComputeResources[0],
  clusterComputeResources[1]
];
export const mockedClusterHostsList1: ComputeResource[] = [
  hostComputeResources[1],
  hostComputeResources[2]
];
export const mockedClusterHostsList2: ComputeResource[] = [
  hostComputeResources[3]
];

// ResourcePools
export const rpResourceBasicInfos: ResourceBasicInfo[] = [
  {
    serverGuid: serverInfoServiceGui,
    value: 'resgroup-389',
    type: 'ResourcePool',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'resgroup-340',
    type: 'ResourcePool',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'resgroup-337',
    type: 'ResourcePool',
  },
  {
    serverGuid: serverInfoServiceGui,
    value: 'resgroup-350',
    type: 'ResourcePool',
  }
];
export const rpComputeResources: ComputeResource[] = [
  {
    ...rpResourceBasicInfos[0],
    name: 'ResourcePool 1',
    parent: null,
    resourcePool: null,
    text: 'ResourcePool 1',
    hasChildren: true,
    objRef: `urn:vmomi:${rpResourceBasicInfos[0].type}:${rpResourceBasicInfos[0].value}:${rpResourceBasicInfos[0].serverGuid}`,
    nodeTypeId: rpResourceBasicInfos[0].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  },
  {
    ...rpResourceBasicInfos[1],
    name: 'ResourcePool 2',
    parent: null,
    resourcePool: null,
    text: 'ResourcePool 2',
    hasChildren: true,
    objRef: `urn:vmomi:${rpResourceBasicInfos[1].type}:${rpResourceBasicInfos[1].value}:${rpResourceBasicInfos[1].serverGuid}`,
    nodeTypeId: rpResourceBasicInfos[1].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  },
  {
    ...rpResourceBasicInfos[2],
    name: 'ResourcePool 3',
    parent: null,
    resourcePool: null,
    text: 'ResourcePool 3',
    hasChildren: true,
    objRef: `urn:vmomi:${rpResourceBasicInfos[2].type}:${rpResourceBasicInfos[2].value}:${rpResourceBasicInfos[2].serverGuid}`,
    nodeTypeId: rpResourceBasicInfos[2].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  },
  {
    ...rpResourceBasicInfos[3],
    name: 'ResourcePool 4',
    parent: null,
    resourcePool: null,
    text: 'ResourcePool 4',
    hasChildren: true,
    objRef: `urn:vmomi:${rpResourceBasicInfos[3].type}:${rpResourceBasicInfos[3].value}:${rpResourceBasicInfos[3].serverGuid}`,
    nodeTypeId: rpResourceBasicInfos[3].type,
    aliases: ['urn:vmomi:ResourcePool:resgroup-24:d7c361cc-0a46-441e-8e21-ac22debf7003'],
    datacenterObjRef: 'urn:vmomi:Datacenter:datacenter-2:d7c361cc-0a46-441e-8e21-ac22debf7003'
  }
];

// Vic RPools
export const vicResourcePoolList: string[] = [
  'resPoolName1',
  'resPoolName2',
  'resPoolName3'
];

// Networking
export const netWorkingResources = [
  {
    text: 'bug-389',
    spriteCssClass: 'vsphere-icon-folder',
    hasChildren: true,
    objRef: 'urn:vmomi:Folder:group-n81:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DcNetworkFolder',
    aliases: null
  },
  {
    text: 'VM Network',
    spriteCssClass: 'vsphere-icon-network',
    hasChildren: false,
    objRef: 'urn:vmomi:Network:network-17:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DcNetwork',
    aliases: null
  },
  {
    text: 'VM Network 2',
    spriteCssClass: 'vsphere-icon-network',
    hasChildren: false,
    objRef: 'urn:vmomi:Network:network-28:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DcNetwork',
    aliases: null
  },
  {
    text: 'DSwitch 1',
    spriteCssClass: 'vsphere-icon-dv-switch',
    hasChildren: true,
    objRef: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-29:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DcDvs',
    aliases: null
  },
  {
    text: 'DSwitch 2',
    spriteCssClass: 'vsphere-icon-dv-switch',
    hasChildren: true,
    objRef: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-25:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DcDvs',
    aliases: null
  }
];
export const folderDSwitchList = [
  {
    text: 'DSwitch-bug-389',
    spriteCssClass: 'vsphere-icon-dv-switch',
    hasChildren: true,
    objRef: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-82:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'NetworkFolderDvs',
    aliases: null
  },
  {
    text: 'DSwitch-bug-389-test',
    spriteCssClass: 'vsphere-icon-dv-switch',
    hasChildren: true,
    objRef: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-86:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'NetworkFolderDvs',
    aliases: null
  }
];
export const folderDSwitchPorGroupsList = [
  {
    text: 'DPG-bug-389-1',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-84:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DPG-bug-389-2',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-85:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch-bug-389-DVUplinks-82',
    spriteCssClass: 'vsphere-icon-uplink-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-83:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch-bug-389-test-1',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-88:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch-bug-389-test-2',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-89:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch-bug-389-DVUplinks-86',
    spriteCssClass: 'vsphere-icon-uplink-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-87:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  }
];
export const dcDSwitchPorGroupsList = [
  {
    text: 'DPortGroup-DS1-1',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-30:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch 1-DVUplinks-29',
    spriteCssClass: 'vsphere-icon-uplink-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-30:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DPortGroup-DS2-1',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-27:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DPortGroup-DS2-2',
    spriteCssClass: 'vsphere-icon-virtual-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-32:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  },
  {
    text: 'DSwitch-DVUplinks-25',
    spriteCssClass: 'vsphere-icon-uplink-port-group',
    hasChildren: false,
    objRef: 'urn:vmomi:DistributedVirtualPortgroup:dvportgroup-26:d7c361cc-0a46-441e-8e21-ac22debf7003',
    nodeTypeId: 'DvsDvpg',
    aliases: null
  }
];
export const dvsHostsEntriesList: ResourceBasicInfo[] = [
  {
    serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
    type: 'HostSystem',
    value: 'host-276'
  },
  {
    serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
    type: 'HostSystem',
    value: 'host-277'
  },
  {
    serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
    type: 'HostSystem',
    value: 'host-278'
  },
  {
    serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
    type: 'HostSystem',
    value: 'host-279'
  },
  {
    serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
    type: 'HostSystem',
    value: 'host-280'
  }
];
