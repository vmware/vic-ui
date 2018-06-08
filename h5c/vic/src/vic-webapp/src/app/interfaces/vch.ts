export type CpuUnit = 'B' | 'MHz';
export type MemoryUnit = 'MiB';
export type ImageSizeUnit = 'MiB' | 'GiB';
export type ServerCertSizeUnit = 'bit'
export type SharesLevel = 'low' | 'normal' | 'high';
export type FirewallPolicyType = 'Closed' | 'Outbound' | 'Peers' | 'Published' | 'Open';


// VCH
export interface Vch {
  version?: string;
  name?: string;
  debug?: number;
  syslog_addr?: string;
  compute?: VchCompute;
  network?: VchNetwork;
  storage?: VchStorage;
  auth?: VchAuth;
  endpoint?: VchEndpoint;
  registry?: VchRegistry;
  container?: VchContainer
  runtime?: VchRuntime;
}

export interface VchView {
  general?: VchGeneralView;
  computeCapacity?: VchComputeView;
  storageCapacity?: VchStorageView;
  networks?: VchNetworkView;
  operations?: any;
  registry?: VchRegistryView;
  security?: VchSecurityView;
}

// VCH General
export interface VchGeneralView {
  name: string;
  containerNameConvention: string;
  debug?: number | string;
  syslogAddress?: string;
}

export interface VchGeneral {
  name: string;
  debug?: number;
  syslog_addr?: string;
  container?: VchContainer;
}

// VCH Compute
export interface VchCompute {
  cpu: {
    limit?: {
      units: CpuUnit;
      value: number
    };
    reservation?: {
      units: CpuUnit;
      value: number
    };
    shares?: {
      number?: number;
      level: SharesLevel
    }
  };
  memory: {
    limit?: {
      units: MemoryUnit;
      value: number
    };
    reservation?: {
      units: MemoryUnit;
      value: number
    };
    shares?: {
      number?: number;
      level: SharesLevel
    }
  };
  resource?: {
    id?: string;
    name: string
  }
}

export interface VchComputeView {
  cpuLimit?: number | string;
  memoryLimit?: number | string;
  cpuReservation?: number | string;
  cpuShares?: SharesLevel;
  memoryShares?: SharesLevel;
  memoryReservation?: number | string;
  endpointCpu?: number | string;
  endpointMemory?: number | string;
  computeResource?: string;
}

// VCH Network
export interface VchNetwork {
  bridge: {
    ip_range: string;
    port_group: {
      id?: string;
      name: string
    }
  };
  client?: {
    port_group: {
      id?: string;
      name?: string
    };
    gateway?: {
      routing_destinations?: string[];
      address: string
    };
    nameservers?: string[];
    static?: string
  };
  management?: {
    port_group: {
      id?: string;
      name?: string
    };
    gateway?: {
      routing_destinations?: string[];
      address: string
    };
    nameservers?: string[];
    static?: string
  };
  public: {
    port_group: {
      id?: string;
      name: string
    };
    gateway?: {
      routing_destinations?: string[];
      address: string
    };
    nameservers?: string[];
    static?: string
  };
  container?: ContainerNetwork[];
  httpProxy?: string;
  httpsProxy?: string
}

export interface ContainerNetwork {
  alias?: string;
  firewall?: FirewallPolicyType;
  nameservers?: string[];
  port_group: {
    id?: string;
    name: string
  };
  gateway?: {
    routing_destinations?: string[];
    address: string
  };
  ip_ranges?: string[]
}

export interface VchNetworkView {
  clientNetwork?: string;
  clientNetworkGateway?: string;
  clientNetworkIp?: string;
  clientNetworkRouting?: string;
  clientNetworkType?: string;
  publicNetwork: string;
  publicNetworkGateway?: string;
  publicNetworkIp?: string;
  publicNetworkType: string;
  bridgeNetwork: string;
  bridgeNetworkRange?: string;
  managementNetwork?: string;
  managementNetworkGateway?: string;
  managementNetworkIp?: string;
  managementNetworkRouting?: string;
  managementNetworkType?: string;
  containerNetworks?: VchContainerNetworkView[];
  dnsServer?: string[];
  httpProxy?: string;
  httpProxyPort?: string;
  httpsProxy?: string;
  httpsProxyPort?: string;
}

export interface VchContainerNetworkView {
  containerNetwork: string;
  containerNetworkDns: string;
  containerNetworkFirewall: FirewallPolicyType;
  containerNetworkGateway?: string;
  containerNetworkIpRange?: string;
  containerNetworkLabel: string;
  containerNetworkType: string;
}

// VCH Storage
export interface VchStorage {
  image_stores: string[];
  volume_stores?: {
    datastore: string;
    label: string
    }[];
  base_image_size: {
    units: ImageSizeUnit;
    value: number | string;
  }
}

export interface VchStorageView {
  baseImageSize: number | string;
  baseImageSizeUnit: ImageSizeUnit;
  fileFolder: string;
  imageStore: string;
  volumeStore?: VchStorageVolumeStoreView[];
}

export interface VchStorageVolumeStoreView {
  dockerVolName: string;
  volDatastore: string;
  volFileFolder: string;
}

// VCH Security / Auth
export interface VchAuth {
  no_tls?: boolean;
  client: {
    no_tls_verify?: boolean;
    certificate_authorities?: {pem: string}[]
  };
  server: {
    certificate?: {
      pem: string
    };
    private_key?: {
      pem: string
    };
    generate?: {
      size: {
        units: ServerCertSizeUnit;
        value: number
      };
      organization?: string[];
      cname?: string
    }
  }
}

export interface VchSecurityView {
  useClientAuth: boolean;
  serverCertSource: string;
  tlsCa?: TlsCaView[];
  target?: string;
  thumbprint?: string;
  user?: string;
  certificateKeySize?: number;
  noTlsverify?: boolean;
  tlsCname?: string;
  organization?: string;
  tlsServerCert?: TlsCaView;
  tlsServerKey?: TlsCaView;
}

export interface TlsCaView {
  content: string;
  expires?: Date;
  name?: string;
  thumbprint?: string;
  algorithm?: string;
}

export const defaultCertificateKeySize = 2048;
export const serverCertSourceAutogenerated = 'autogenerated';
export const serverCertSourceExisting = 'existing';

// VCH Endpoint
export interface VchEndpoint {
  memory?: {
    units: MemoryUnit;
    value: number
  };
  cpu?: {
    sockets: number
  };
  operations_credentials?: {
    password: string;
    user: string;
    grant_permissions?: true
  }
}

// VCH Registry
export interface VchRegistry {
  insecure?: string[];
  whitelist?: string[];
  certificate_authorities?: { pem: string }[];
  image_fetch_proxy?: {
    http?: string;
    https?: string
  }
}

export interface VchRegistryView {
  insecureRegistry: string[],
  registryCa: TlsCaView[],
  whitelistRegistry: string[],
  useWhitelistRegistry: boolean
}

// VCH Runtime
export interface VchRuntime {
  power_state?: string;
  upgrade_status?: string;
  admin_portal?: string;
  docker_host?: string
}

// VCH Container
export interface VchContainer {
  name_convention?: string
}



export type VchViewTypes = VchView | VchGeneralView | VchComputeView | VchStorageView | VchNetworkView | VchSecurityView | VchRegistryView;
export type VchViewKeys = 'general' | 'computeCapacity' | 'storageCapacity' | 'networks' | 'security' | 'registry';
