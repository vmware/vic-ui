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
  Observable.of({
    id: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-29:d7c361cc-0a46-441e-8e21-ac22debf7003',
    'dvs:dvsHostsData': {
      dvsHosts: [
        {
          hostName: '10.192.109.234',
          clusterName: null,
          connectionState: 'connected',
          connectionStateLabel: 'Connected',
          hostIconId: 'vsphere-icon-host-warning',
          vdsState: 'Up',
          vdsStateIcon: 'statusGreen',
          hostRef: {value: 'host-94', type: 'HostSystem', serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003'},
          compatibilityErrors: []
        }
      ]}
  }),
  Observable.of({
    id: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-25:d7c361cc-0a46-441e-8e21-ac22debf7003',
    'dvs:dvsHostsData': {
      dvsHosts: [
        {
          hostName: '10.161.251.202',
          clusterName: 'New Cluster',
          connectionState: 'connected',
          connectionStateLabel: 'Connected',
          hostIconId: 'vsphere-icon-host-warning',
          vdsState: 'Up',
          vdsStateIcon: 'statusGreen',
          hostRef: {value: 'host-20', type: 'HostSystem', serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003'},
          compatibilityErrors: []
        },
        {
          hostName: '10.162.17.176',
          clusterName: 'New Cluster',
          connectionState: 'connected',
          connectionStateLabel: 'Connected',
          hostIconId: 'vsphere-icon-host-warning',
          vdsState: 'Up',
          vdsStateIcon: 'statusGreen',
          hostRef: {value: 'host-9', type: 'HostSystem', serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003'},
          compatibilityErrors: []
        }
      ]}
  }),
  Observable.of({
    id: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-82:d7c361cc-0a46-441e-8e21-ac22debf7003',
    'dvs:dvsHostsData': {
      dvsHosts: [
        {
          hostName: '10.192.109.234',
          clusterName: null,
          connectionState: 'connected',
          connectionStateLabel: 'Connected',
          hostIconId: 'vsphere-icon-host-warning',
          vdsState: 'Up',
          vdsStateIcon: 'statusGreen',
          hostRef: {value: 'host-94', type: 'HostSystem', serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003'},
          compatibilityErrors: []
        }
      ]}
  }),
  Observable.of({
    id: 'urn:vmomi:VmwareDistributedVirtualSwitch:dvs-86:d7c361cc-0a46-441e-8e21-ac22debf7003',
    'dvs:dvsHostsData': {
      dvsHosts: [
        {
          hostName: '10.192.109.234',
          clusterName: null,
          connectionState: 'connected',
          connectionStateLabel: 'Connected',
          hostIconId: 'vsphere-icon-host-warning',
          vdsState: 'Up',
          vdsStateIcon: 'statusGreen',
          hostRef: {value: 'host-94', type: 'HostSystem', serverGuid: 'd7c361cc-0a46-441e-8e21-ac22debf7003'},
          compatibilityErrors: []
        }
      ]}
  })
];
