export type CpuUnit = 'B' | 'MHz';
export type MemoryUnit = 'MiB';
export type ImageSizeUnit = 'MiB' | 'GiB';
export type ServerCertSizeUnit = 'bit'
export type SharesLevel = 'low' | 'normal' | 'high';
export type FirewallPolicyType = 'Closed' | 'Outbound' | 'Peers' | 'Published' | 'Open';


// VCH
export interface VchApi {
  version?: string,
  name?: string,
  debug?: number,
  syslog_addr?: string,
  compute?: VchApiCompute,
  network?: VchApiNetwork,
  storage?: VchApiStorage,
  auth?: VchApiAuth,
  endpoint?: VchApiEndpoint,
  registry?: VchApiRegistry,
  container?: VchApiContainer
  runtime?: VchApiRuntime,
}

export interface VchUi {
  general?: VchUiGeneral;
  computeCapacity?: VchUiCompute;
  storageCapacity?: VchUiStorage;
  networks?: VchUiNetwork;
  operations?: any,
  registry?: any,
  security?: any
}

// VCH General
export interface VchUiGeneral {
  name: string;
  containerNameConvention: string;
  debug?: number | string;
  syslogAddress?: string;
}

export interface VchApiGeneral {
  name: string;
  debug?: number;
  syslog_addr?: string;
  container?: VchApiContainer;
}

// VCH Compute
export interface VchApiCompute {
  cpu: {
    limit?: {
      units: CpuUnit,
      value: number
    },
    reservation?: {
      units: CpuUnit,
      value: number
    },
    shares?: {
      number?: number,
      level: SharesLevel
    }
  },
  memory: {
    limit?: {
      units: MemoryUnit,
      value: number
    },
    reservation?: {
      units: MemoryUnit,
      value: number
    },
    shares?: {
      number?: number,
      level: SharesLevel
    }
  },
  resource?: {
    id?: string,
    name: string
  }
}

export interface VchUiCompute {
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
export interface VchApiNetwork {
  bridge: {
    ip_range: string,
    port_group: {
      id?: string,
      name: string
    }
  },
  client?: {
    port_group: {
      id?: string,
      name?: string
    },
    gateway?: {
      routing_destinations?: string[],
      address: string
    },
    nameservers?: string[],
    static?: string
  },
  management?: {
    port_group: {
      id?: string,
      name?: string
    },
    gateway?: {
      routing_destinations?: string[],
      address: string
    },
    nameservers?: string[],
    static?: string
  },
  public: {
    port_group: {
      id?: string,
      name: string
    },
    gateway?: {
      routing_destinations?: string[],
      address: string
    },
    nameservers?: string[],
    static?: string
  },
  container?: ContainerNetworkApi[],
  httpProxy?: string,
  httpsProxy?: string
}

export interface ContainerNetworkApi {
  alias?: string,
  firewall?: FirewallPolicyType,
  nameservers?: string[],
  port_group: {
    id?: string,
    name: string
  },
  gateway?: {
    routing_destinations?: string[],
    address: string
  },
  ip_ranges?: string[]
}

export interface VchUiNetwork {
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
  containerNetworks?: VchContainerNetworkUi[];
  dnsServer?: string[];
  httpProxy?: string;
  httpProxyPort?: string;
  httpsProxy?: string;
  httpsProxyPort?: string;
}

export interface VchContainerNetworkUi {
  containerNetwork: string;
  containerNetworkDns: string;
  containerNetworkFirewall: FirewallPolicyType;
  containerNetworkGateway?: string;
  containerNetworkIpRange?: string;
  containerNetworkLabel: string;
  containerNetworkType: string;
}

// VCH Storage
export interface VchApiStorage {
  image_stores: string[],
  volume_stores?: {
    datastore: string;
    label: string
    }[],
  base_image_size: {
    units: ImageSizeUnit,
    value: number | string;
  }
}

export interface VchUiStorage {
  baseImageSize: number | string;
  baseImageSizeUnit: ImageSizeUnit;
  fileFolder: string;
  imageStore: string;
  volumeStore?: VchUiStorageVolumeStore[];
}

export interface VchUiStorageVolumeStore {
  dockerVolName: string;
  volDatastore: string;
  volFileFolder: string;
}

// VCH Auth
export interface VchApiAuth {
  no_tls?: true,
  client: {
    no_tls_verify?: true,
    certificate_authorities?: [
      {
        pem: string
      }
      ]
  },
  server: {
    certificate?: {
      pem: string
    },
    private_key?: {
      pem: string
    },
    generate?: {
      size: {
        units: ServerCertSizeUnit,
        value: number
      },
      organization?: string[],
      cname?: string
    }
  }
}

// VCH Endpoint
export interface VchApiEndpoint {
  memory?: {
    units: MemoryUnit,
    value: number
  },
  cpu?: {
    sockets: number
  },
  operations_credentials?: {
    password: string,
    user: string,
    grant_permissions?: true
  }
}

// VCH Registry
export interface VchApiRegistry {
  insecure?: string[],
  whitelist?: string[],
  certificate_authorities?: [
    {
      pem: string
    }
    ],
  image_fetch_proxy?: {
    http?: string,
    https?: string
  }
}

// VCH Runtime
export interface VchApiRuntime {
  power_state?: string,
  upgrade_status?: string,
  admin_portal?: string,
  docker_host?: string
}

// VCH Container
export interface VchApiContainer {
  name_convention?: string
}



export type VchUiModelTypes = VchUi | VchUiGeneral | VchUiCompute | VchUiStorage | VchUiNetwork;
export type VchUiModelKeys = 'general' | 'computeCapacity' | 'storageCapacity' | 'networks';
