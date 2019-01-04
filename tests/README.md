# VIC UI Testing

## Background

VIC UI is a HTML5 Client Plugin for vSphere. It is written in Angular on the
client side and a Java service to interface with the vSphere web API. The current functionality
includes the following:

Portlets:
Panels of information that are displayed for the VM, host, or cluster

VCH Creation wizard:
A UI wizard that allows the user to create a Virtual Container Host
via the vic-machine-service API

VCH Edit Wizard (tbd):
A UI wizard that allows the user to edit a Virtual Container Host
via the vic-machine-service API

VIC OVA and Plugin upgrade (tbd):
Via the VIC admin interface will allow users to upgrade the VIC OVA and the VIC UI
Plugin

## Testing overview

Testing is done within targeted operating systems, browsers, and against
targeted vSphere test environments.

Areas of testing inlude:
- Plugin Installation
- Plugin Uninstallation
- Plugin Upgrade
- Portlets
- VCH Create
- VCH Edit (tbd)
- VCH Delete
- VIC Upgrade (tbd)

VIC UI utilized both unit tests and end to end (e2e) tests.

## Targeted users

VIC UI Plugin users are primariy but not limited to VI Admins

## Targeted test environments

- H5 Client running on VC build 7312210 (6.5) / ESX build 5310538
- H5 Client running on VC build ob-7822395 (6.7) / ESX build 7836994

Operating systems:
- Mac OSX
- Ubuntu
- Windows

VC variations:
- Single cluster
- Empty clusters
- Multi datacenter
- Multi distrubuted switch
- Enhanced linked mode (tbd)

## Targeted test browsers

- Windows Chrome
- Windows Firefox
- Windows IE11
- Mac Chrome
- Mac Firefox

## Unit tests

Unit tests are executed on build and can be run locally
and are run on each pull request and push to master with CI.

CI runs can be found here:
https://ci.vcna.io/vmware/vic-ui

They are executed using Karma (http://karma-runner.github.io/)

Build with ant to run unit tests locally:

from /h5c

ant -f build-deployable.xml

## e2e tests

e2e tests are executed on our nightly test servers

They are executed using:

- Protractor (http://www.protractortest.org/#/)
- Jasmine (https://jasmine.github.io/)

Use ng to run e2e tests locally:

from /h5c/vic/src/vic-webapp/

ng e2e

----------------

## Key Features
=============
Key customer facing features that should be tested

Installation
----------------------
1. Run install script
2. Restart vcenter server
3. Login to vc
4. Verify plugin is accessible

Uninstallation
----------------------
1. Run uninstall script
2. Restart vcenter server
3. Login to vc
4. Verify plugin is no longer visible in vc

Upgrade
----------------------
1. Run upgrade script
2. Restart vcenter server
3. Login
4. Verify plugin version has been upgraded (found in plugin summary panel)

VCH Lifecycle tests
----------------------
Environments:
single cluster
empty clusters
multi-datacenter VC
Enhanced linked VC (tbd)

Successful VCH Create
----------------------
1. Using UI wizard create a VCH
2. Verify VCH has been added to VCH inventory list

Successful VCH Edit (tbd)
----------------------
1. From VCH view click 'Configure' tab
2. Using VCH edit wizard update the configureation of the VCH
3. Verify the VCH has been successfully updated with the new configurations

Successful VCH Delete
----------------------
1. From VCH list click 'Delete VCH'
2. Verify VCH has been deleted from VCH inventory list

## Typical customer configuration scenarios to support for VCH creation
-Using Static IP for Public network
-Needing to override bridge network range
-Having separate IP for Management (typically static, with static routing necessary to
reach certain management components that are not L2-adjacent)
-Container network with user-defined IP range
-User provided registry Ca certs

## Typical CLI creation configs that we should support in the wizard (sensitive data obscured)
./vic-machine-windows.exe create \
--target snvcenterlabd1 \
--user administrator@vsphere.local \
--compute-resource RegionA01-COMP01 \
--image-store RegionA01-ISCSI01-COMP01 \
--volume-store RegionA01-ISCSI01-COMP01:default \
--public-network VM-RegionA01-vDS-COMP \
--public-network-ip 192.168.100.22/24 \
--public-network-gateway 192.168.100.1 \
--dns-server 192.168.110.10 \
--container-network VM-RegionA01-vDS-COMP:routable \
--container-network-firewall VM-RegionA01-vDS-COMP:open \
--bridge-network Bridge01-RegionA01-vDS-COMP \
--bridge-network-range 10.0.0.0/12 \
--name apvch1 \
--registry-ca=/etc/docker/certs.d/registry.corp.local/ca.crt
--no-tls-verify


./vic-machine-darwin create \
--target pzydsu7.pldc.acme.org \
--user svcvra6 \
--name VCH4 \
--bridge-network VCH4 \
--bridge-network-range 192.168.100.0/16 \
--image-store DEVOPS_VMDS_03 \
--volume-store DEVOPS_VMDS_04:dockernfsvolume \
--compute-resource DevOps_PDC_04 \
--public-network 172.16.66.0_24 \
--management-network 172.16.50.0_24 \
--management-network-ip 172.16.50.32 \
--management-network-gateway 172.16.50.0/24:172.16.50.1/24 \
--container-network 172_16_66_0_27:transaction_network \
--container-network-dns 172_16_66_0_27:172.16.9.21 \
--no-tls-verify \
--insecure-registry 172.16.66.199


./vic-machine-linux create \
--name VCH04-Dev \
--target 'administrator@vsphere.local'@10.121.240.52 \
--tls-cname ncflabvctr01l.labs.acme.com \
--public-network 'T7777_DSvMNetwork2' \
--public-network-ip 10.121.240.105 \
--public-network-gateway 10.121.240.1/24 \
--bridge-network ‘T7777_DSvICBridge_Dev04' \
--dns-server 10.97.40.215 \
--no-tlsverify \
--image-store VNX_ISO \
--volume-store VNX_ISO:default


./vic-machine-linux create \
--target vcenter.acme.com \
--user 'administrator@vsphere.local' \
--name AcmeVCH10 \
--bridge-network 'Management Networks'/vxw-dvs-9-virtualwire-10-sid-6009-acme-vic-poc-vxlan10 \
--image-store vsanDatastore \
--volume-store vsanDatastore:default \
--compute-resource Acme-Cluster \
--public-network 'Management Networks'/SDDC-DPortGroup-Mgmt \
--public-network-ip 1.1.1.149/24 \
--public-network-gateway 1.1.1.1 \
--registry-ca /etc/docker/certs.d/1.1.1.150/ca.crt \
--dns-server 1.1.1.4 \
--no-tls-verify \
--container-network 'Management Networks'/SDDC-DPortGroup-Mgmt:external \
--container-network-ip-range 'Management Networks'/SDDC-DPortGroup-Mgmt:1.1.1.130-1.1.1.134 \
--container-network-gateway 'Management Networks'/SDDC-DPortGroup-Mgmt:1.1.1.1/24 \
--container-network-dns 'Management Networks'/SDDC-DPortGroup-Mgmt:1.1.1.4


## Test cases
(TestCases.md)
