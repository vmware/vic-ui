# API Requirements for VIC Appliance Admin UI

## Overview
This is a preliminary set of API endpoints for what previously was the Getting Started page for the VIC Appliance. It is now replaced by a single page aplication that not only serves Getting Started resources but also provides interfaces to reconfigure the deployed VIC Appliance VM, upgrade the VIC Appliance, and manage the lifecycle of the H5 Client plugin for the vSphere Integrated Containers.

## Intended Audience
The API would not be used directly by audience - VI admins. It would mostly be accessed through the VIC Appliance Admin UI to perform configuration on the appliance, appliance upgrade and plugin lifecycle operations. The API could be later used from inside the H5 Client plugin.

## Authentication
  - ### login
  
    - #### Purpose
    
      Authenticate the user into the specified vCenter Server instance so the VIC Appliance can be configured and upgraded.

    - #### Method
  
      POST
  
    - #### Request body

      ```
      {
        username: string;
        password: string;
      }
      ```

    - #### Notes

      This endpoint returns a token that will be validated for any action in the Configuration secion of the Appliance Admin UI. In a success response it should return a JWT token that could be used by UI to keep a user session alive for a certain period of time. How long we want to keep the token valid is pending further discussions

## Appliance
  - ### isApplianceReady

    - #### Purpose

      Check if the web interface of the VIC Appliance is ready to be accessed.

    - #### Method

      GET

    - #### Notes

      This endpoint is polled at a certain interval until the appliance has booted and become ready before any critical tasks can be performed. Its expected return format is a boolean value.

  - ### registerWithPSC

    - #### Purpose

      Register the VIC Appliance with the PSC

    - #### Method

      POST

    - #### Request body

      ```
      {
        username: string;
        password: string;
        external_psc?: string;
        external_psc_domain?: string;
      };
      ```

    - #### Notes

      This is an endpoint to be called in the appliance initialization page. In a response, it should return a boolean value indiciating whether the action was successful. Also if the registration was not successful, it should provide an optional error message that can be displayed in the UI

  - ### reregisterWithPSC

    - #### Purpose

      Reregister the VIC Appliance with the PSC

    - #### Method

      GET

    - #### Notes

      Since we are leaning toward not allowing the user to modify target VC information in the Applinace Admin UI, the endpoint should not accept URL params for those. Similar to `registerWithPSC`, it should return a boolean value for whether the action was successful and an optional error message.


  - ### isRegisteredWithPSC

    - #### Purpose

      Check if the VIC Appliance is initialized

    - #### Method

      GET

    - #### Notes

      The response from this endpoint is used by the UI to determine whether or not to show the appliance registration screen. If registered already, it goes render the landing page of the Admin UI.

  - ### getVCFingerprint (pending)

    - #### Purpose

      Fetch the SHA-1 fingerprint from the target VC

    - #### Method

      GET

    - #### Notes

      Fingerprint verification workflow is currently subject to change

  - ### applianceConfig

    - #### Purpose

      Fetch/update VIC appliance configurations

    - #### Method

      GET, PATCH

    - #### Request Body

      ```
      {
        appliance_security: {
          root_password: string;
          permit_root_login: boolean;
        };
        networking: {
          network_ip_address: string (or IP pattern);
          network_mask: number;
          default_gateway: string (or IP pattern);
          dns: string[];
          dns_search_path: string;
          fqdn: string;
        };
        registry: {
          use_docker_registry: boolean;
          registry_port: number;
          notary_port: number;
          registry_admin_password: string;
          db_password: string;
          garbage_collection: boolean;
          ssl_cert: string;
          ssl_key: string;
        };
        management_portal: {
          deploy_portal: boolean;
          portal_port: number;
          ssl_cert: string;
          ssl_key: string;
        };
        fileserver: {
          fileserver_port: number;
          ssl_cert: string;
          ssl_key: string;
        }
      }
      ```

  - ### downloadLogBundle

    - #### Purpose
  
      Download VIC appliance log bundle

    - #### Method

      GET
  
  - ### getTargetVcAddress

    - #### Purpose

      Get target VC address

    - #### Method

      GET

    - Notes
    
      We are not allowing the user to change the target VC (and external PSC) information through the Admin UI. However, displaying which VC the appliance is going to be registered with is an important piece of information to display during PSC registration, plugin registration and upgrade actions. This endpoint could be extended such that it provides more general information on the VC that needs to be checked and confirmed by the user.


  - ### getVicEngineTarballUrl

    - #### Purpose

      Get URL to the VIC Engine tarball file from the fileserver

    - #### Method

      GET

  - ### vcPlugin

    - #### Purpose

      Perform check/install/uninstall/upgrade of the H5 Client plugin for the vSphere Client

    - #### Method

      GET, POST, PUT, DELETE

    - #### Notes

      GET: return the version information if installed.
      
      POST: register the plugin with VC.

      PUT: perform version check and register the plugin with force flag.

      DELETE: unregister the plugin from VC.

## Upgrade
  - ### upgradeAvailable

    - #### Purpose
    
      Get the VIC Appliance version to be upgraded

    - #### Method

      GET

  - ### getCurrentVersion

    - #### Purpose

      Get the current Appliance version from /etc/vmware/version

    - #### Method

      GET

  - ### getComputeResources (pending)

    - #### Purpose

      Get compute resources list from the VC

    - #### Notes

      According to the mockup we are displaying the compute resource selector which implies that we can change the compute resource where the VIC appliance is going to run. Whether that operation is allowed depends on further discussions.

  - ### upgrade (pending)

    - #### Purpose

      Perform upgrade on an older instance of the VIC Appliance to the latest

    - #### Method

      POST

    - #### Request body

      ```
      {
        username: string;
        password: string;
        source_appliance_ref: string; (e.g. vm-100)
        compute_resource: string (e.g. /Datacenter/host/Cluster);
      }
      ```

    - #### Notes

      As far as the security concerns go, we don't want to expose the ability to alter the target VC location in a request payload, but it's subject to change.
