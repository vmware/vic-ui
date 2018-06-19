import {Observable} from 'rxjs/Observable';

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
  Observable.of([{
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
  }]),
  Observable.of([{
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
  }])
];

export const dcDSwitchPorGroupsList = [
  Observable.of([{
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
  }]),
  Observable.of([{
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
  }])
];

export const dvsHostsEntries = [
  Observable.of([
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-276'
    }
  ]),
  Observable.of([
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-277'
    },
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-278'
    }
  ]),
  Observable.of([
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-279'
    }
  ]),
  Observable.of([
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-280'
    }
  ])
];

export const ClusterHostsChilds = Observable.of([
    {
      serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003',
      type: 'HostSystem',
      value: 'host-276'
    }
]);

export const dcMockData = [
  {
    text: 'ha-datacenter',
    spriteCssClass: 'vsphere-icon-datacenter',
    hasChildren: true,
    objRef: 'urn:vmomi:Datacenter:datacenter-2:196f7764-7aec-42d8-9def-6b5899b7e0e1',
    nodeTypeId: 'Datacenter',
    aliases: [
      'urn:vmomi:Folder:group-h4:196f7764-7aec-42d8-9def-6b5899b7e0e1',
      'urn:vmomi:Folder:group-v3:196f7764-7aec-42d8-9def-6b5899b7e0e1',
      'urn:vmomi:Folder:group-s5:196f7764-7aec-42d8-9def-6b5899b7e0e1',
      'urn:vmomi:Folder:group-n6:196f7764-7aec-42d8-9def-6b5899b7e0e1']
  }
];

export const dcClustersAndStandAloneHosts = [
  {
    text: '10.161.75.158 (Reboot Required)',
    spriteCssClass: 'vsphere-icon-host-warning',
    hasChildren: true,
    objRef: 'urn:vmomi:HostSystem:host-15:196f7764-7aec-42d8-9def-6b5899b7e0e1',
    nodeTypeId: 'DcStandaloneHost',
    aliases: ['urn:vmomi:ResourcePool:resgroup-14:196f7764-7aec-42d8-9def-6b5899b7e0e1']
  }
];

export const computeResourcesRealName = [
  {
    name: '10.161.75.158',
    id: 'urn:vmomi:HostSystem:host-15:196f7764-7aec-42d8-9def-6b5899b7e0e1'
  }
];
