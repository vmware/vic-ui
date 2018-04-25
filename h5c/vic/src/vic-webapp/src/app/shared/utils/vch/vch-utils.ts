/**
 * Transform wizard payload before sending it to vic-machine-service API
 */
import {
  VchApi, VchApiAuth, VchApiCompute, VchApiContainer, VchApiEndpoint,
  VchApiNetwork, VchApiRegistry,
  VchApiStorage, VchUi,
} from '../../../interfaces/vch';

export function processPayloadFromUiToApi(payload): VchApi {

  const processedPayload: VchApi = {};

  // Compute ----------------------------------------------------------------------------

  let vchCompute: VchApiCompute;

  if (payload.computeCapacity) {

    vchCompute = {
      cpu: {
        limit: {
          // TODO: use selected unit from payload once units selectors are implemented
          units: 'MHz',
          value: parseInt(payload.computeCapacity.cpu, 10)
        }
      },
      memory: {
        limit: {
          units: 'MiB',
          value: parseInt(payload.computeCapacity.memory, 10)
        }
      }
    };

    if (payload.computeCapacity.computeResource) {
      vchCompute.resource = {
        name: payload.computeCapacity.computeResource
      }
    }

    if (payload.computeCapacity.cpuReservation) {
      vchCompute.cpu.reservation = {
        units: 'MHz',
        value: parseInt(payload.computeCapacity.cpuReservation, 10)
      };
      vchCompute.cpu.shares = {
        level: payload.computeCapacity.cpuShares
      };
      vchCompute.memory.reservation = {
        units: 'MiB',
        value: parseInt(payload.computeCapacity.memoryReservation, 10)
      };
      vchCompute.memory.shares = {
        level: payload.computeCapacity.memoryShares
      };
    }
  }

  // Endpoint ---------------------------------------------------------------------------

  let vchEndpoint: VchApiEndpoint;

  if (payload.operations || (payload.computeCapacity && payload.computeCapacity.endpointCpu)) {

    vchEndpoint = {};

    if (payload.operations) {
      vchEndpoint.operations_credentials = {
          user: payload.operations.opsUser,
          password: payload.operations.opsPassword
      };

      if (payload.operations.opsGrantPerms) {
        vchEndpoint.operations_credentials.grant_permissions = payload.operations.opsGrantPerms;
      }
    }

    if (payload.computeCapacity) {

      if (payload.computeCapacity.endpointCpu) {
        vchEndpoint.cpu = {
          sockets: parseInt(payload.computeCapacity.endpointCpu, 10)
        };
      }

      if (payload.computeCapacity.endpointMemory) {
        vchEndpoint.memory = {
          units: 'MiB',
          value: parseInt(payload.computeCapacity.endpointMemory, 10)
        };
      }
    }

  }

  // Storage ----------------------------------------------------------------------------

  let vchStorage: VchApiStorage = null;

  if (payload.storageCapacity) {

    vchStorage = {
      image_stores: [payload.storageCapacity.imageStore + (payload.storageCapacity.fileFolder || '')],
      base_image_size: {
        units: payload.storageCapacity.baseImageSizeUnit,
        value: parseInt(payload.storageCapacity.baseImageSize, 10)
      }
    };

    if (payload.storageCapacity.volumeStore.length) {
      vchStorage.volume_stores = payload.storageCapacity.volumeStore.map(vol => {
        return {
          datastore: vol.volDatastore + (vol.volFileFolder || ''),
          label: vol.dockerVolName
        };
      })
    }

  }

  // Networks ---------------------------------------------------------------------------

  let vchNetwork: VchApiNetwork = null;

  if (payload.networks) {

    vchNetwork = {
      bridge: {
        ip_range: payload.networks.bridgeNetworkRange,
        port_group: {name: payload.networks.bridgeNetwork}
      },
      public: {
        port_group: {name: payload.networks.publicNetwork}
      }
    };

    if (payload.networks.publicNetworkIp) {
      vchNetwork.public.static = payload.networks.publicNetworkIp;
      vchNetwork.public.gateway = {
        address: payload.networks.publicNetworkGateway
      };
    }

    if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
      vchNetwork.public.nameservers = payload.networks.dnsServer;
    }

    if (payload.networks.clientNetwork) {
      vchNetwork.client = {
        port_group: {
          name: payload.networks.publicNetwork
        }
      };

      if (payload.networks.clientNetworkIp) {
        vchNetwork.client.static = payload.networks.clientNetworkIp;
        /*{
          ip: payload.networks.clientNetworkIp
        };*/

        vchNetwork.client.gateway = {
          address: payload.networks.clientNetworkGateway
        };

        if (payload.networks.clientNetworkRouting && payload.networks.clientNetworkRouting.length) {
          vchNetwork.client.gateway.routing_destinations = payload.networks.clientNetworkRouting;
        }

        if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
          vchNetwork.client.nameservers = payload.networks.dnsServer;
        }
      }
    }

    if (payload.networks.managementNetwork) {
      vchNetwork.management = {
        port_group: {
          name: payload.networks.managementNetwork
        }
      };

      if (payload.networks.managementNetworkIp) {
        vchNetwork.management.static = payload.networks.managementNetworkIp;

        vchNetwork.management.gateway = {
          address: payload.networks.managementNetworkGateway
        };

        if (payload.networks.managementNetworkRouting && payload.networks.managementNetworkRouting.length) {
          vchNetwork.management.gateway.routing_destinations = payload.networks.managementNetworkRouting;
        }

        if (payload.networks.dnsServer && payload.networks.dnsServer.length) {
          vchNetwork.management.nameservers = payload.networks.dnsServer;
        }
      }
    }

    if (payload.networks.containerNetworks && payload.networks.containerNetworks.length) {
      vchNetwork.container = payload.networks.containerNetworks.map(net => {
        const network = {
          port_group: {
            name: net.containerNetwork
          }
        };

        if (net.containerNetworkDns) {
          network['nameservers'] = [net.containerNetworkDns];
        }

        if (net.containerNetworkLabel) {
          network['alias'] = net.containerNetworkLabel;
        }

        if (net.containerNetworkFirewall) {
          network['firewall'] = net.containerNetworkFirewall;
        }

        if (net.containerNetworkIpRange) {
          network['ip_ranges'] = [net.containerNetworkIpRange];

          network['gateway'] = {
            address: net.containerNetworkGateway
          };
        }

        return network;
      });
    }

  }

  // Auth -------------------------------------------------------------------------------

  let vchAuth: VchApiAuth = null;

  if (payload.security) {

    vchAuth = {
      client: {},
      server: {}
    };

    if (payload.security.noTlsverify) {
      vchAuth.client = {'no_tls_verify': true};
    } else {
      vchAuth.client = {'certificate_authorities': payload.security['tlsCa'].map(cert => ({pem: cert.content}))};
    }

    if (payload.security.tlsCname) {
      vchAuth.server = {
        generate: {
          size: {
            value: parseInt(payload.security.certificateKeySize, 10),
            units: 'bit'
          },
          cname: payload.security.tlsCname
        },
      };

      if (payload.security.organization) {
        vchAuth.server.generate['organization'] = [payload.security.organization]
      }
    } else if (payload.security.tlsServerCert) {
      vchAuth.server = {
        certificate: {pem: payload.security.tlsServerCert.content},
        private_key: {pem: payload.security.tlsServerKey.content}
      }
    } else {
      vchAuth.server = {
        generate: {
          size: {
            value: 2048,
            units: 'bit'
          },
          organization: [payload.general.name || null],
          cname: payload.general.name || null
        }
      }
    }

  }

  // Registry ---------------------------------------------------------------------------

  let vchRegistry: VchApiRegistry = null;

  if (payload.registry || payload.networks) {

    vchRegistry = {};

    if (payload.registry) {
      if (payload.registry.whitelistRegistry && payload.registry.whitelistRegistry.length) {
        vchRegistry.whitelist = payload.registry.whitelistRegistry;
      }

      if (payload.registry.insecureRegistry && payload.registry.insecureRegistry.length) {
        vchRegistry.insecure = payload.registry.insecureRegistry;
      }

      if (payload.registry.registryCa && payload.registry.registryCa.length) {
        vchRegistry.certificate_authorities = payload.registry.registryCa.map(cert => ({pem: cert.content}));
      }
    }

    if (payload.network) {
      if (payload.networks.httpProxy || payload.networks.httpsProxy) {
        vchRegistry.image_fetch_proxy = {};

        if (payload.networks.httpProxy) {
          vchRegistry.image_fetch_proxy.http = payload.networks.httpProxy;
        }

        if (payload.networks.httpsProxy) {
          vchRegistry.image_fetch_proxy.https = payload.networks.httpsProxy;
        }
      }
    }

  }

  // Container --------------------------------------------------------------------------

  let vchContainer: VchApiContainer = null;

  if (payload.general && payload.general.containerNameConvention) {
    vchContainer = {
      name_convention: payload.general.containerNameConvention
    };
  }

  // General ----------------------------------------------------------------------------

  // TODO: add vch vm name template
  if (payload.general) {

    if (payload.general.name) {
      processedPayload.name = payload.general.name;
    }

    if (payload.general.debug) {
      processedPayload.debug = parseInt(payload.general.debug, 10);
    }

    if (payload.general.syslogAddress) {
      processedPayload.syslog_addr = payload.general.syslogAddress;
    }

  }

  // ------------------------------------------------------------------------------------

  if (vchCompute) {
    processedPayload.compute = vchCompute;
  }

  if (vchNetwork) {
    processedPayload.network = vchNetwork;
  }

  if (vchStorage) {
    processedPayload.storage = vchStorage;
  }

  if (vchAuth) {
    processedPayload.auth = vchAuth;
  }

  if (vchEndpoint) {
    processedPayload.endpoint = vchEndpoint;
  }

  if (vchRegistry) {
    processedPayload.registry = vchRegistry;
  }

  if (vchContainer) {
    processedPayload.container = vchContainer;
  }

  return processedPayload;
}


export function processPayloadFromApiToUi (vch: VchApi): VchUi {
  const uiModel: VchUi = {
    general: {
      name: vch.name,
      containerNameConvention: vch.container.name_convention || '',
      debug: vch.debug,
      syslogAddress: vch.syslog_addr || ''
    },
    computeCapacity: {
      cpuLimit: vch.compute.cpu.limit ? vch.compute.cpu.limit.value : null,
      memoryLimit: vch.compute.memory.limit ? vch.compute.memory.limit.value : null,
      cpuReservation: vch.compute.cpu.reservation ? vch.compute.cpu.reservation.value : null,
      cpuShares: vch.compute.cpu.shares.level,
      memoryShares: vch.compute.memory.shares.level,
      memoryReservation: vch.compute.memory.reservation ? vch.compute.memory.reservation.value : null,
      endpointCpu: vch.endpoint.cpu.sockets,
      endpointMemory: vch.endpoint.memory.value,
      computeResource: vch.compute.resource.id
    }
  };
  return uiModel;
}
