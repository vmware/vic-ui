# VIC UI Testing

## Background

VIC UI is a Flex and HTML5 Client Plugin for vSphere. It is written in Angular on the
client side and a Java service to interface with the vSphere web API. The current functionality
includes the following:

Portlets:
Panels of information that are displayed for the VM, host, or cluster

VCH Creation wizard:
A UI wizard that allows the user to create a Virtual Container Host
via the vic-machine-service API

VCH Edit Wizard (future):
A UI wizard that allows the user to edit a Virtual Container Host
via the vic-machine-service API

VIC OVA and Plugin upgrade (future):
Via the VIC admin interface will allow users to upgrade the VIC OVA and the VIC UI
Plugin

## Testing overview

Testing is done within targeted test browsers and against
targeted vSphere test environments.

Areas of testing inlude:
- Plugin Installation
- Plugin Uninstallation
- Plugin Upgrade
- Portlets
- VCH Create
- VCH Edit (future)
- VCH Delete (future)
- VIC Upgrade (future)

VIC UI utilized both unit tests and end to end (e2e) tests.

## Targeted users

VIC UI Plugin users are primariy but not limited to VI Admins

## Targeted test environments

H5 Client running on Vcenter 6.5
H5 Client running on Vcenter 6.7

Operating systems:
Mac
Ubuntu
Windows

vc variations:
-single cluster
-empty clusters
-multi datacenter
-multi distrubuted switch
-enhanced linked mode (future)

ESX build 5310538 / VC build 7312210 (6.5)

## Targeted test browsers

Windows Chrome
Windows Firefox
Windows IE11

Mac Chrome
Mac Firefox

## Unit tests

Unit tests are executed on build and can be run locally
and are run on each pull request and push to master with CI.

CI runs can be found here:
https://ci.vcna.io/vmware/vic-ui

They are executed using Karma.

Build with ant to run unit tests locally:

from /h5c

ant -f build-deployable.xml


## e2e tests

e2e tests are executed on our nightly test servers

They are executed using:

Protractor
Jasmine

Build with ant to run unit tests locally:

from /h5c/vic/src/vic-webapp

ng e2e

Key Scenarios
=============

Key customer scenarios we should be sure to test.

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
Enhanced linked VC (future)

Successful VCH Create
----------------------

1. Using UI wizard create a VCH
2. Verify VCH has been added to VCH inventory list

Successful VCH Delete
----------------------

1. From VCH list click 'Delete VCH'
2. Verify VCH has been deleted from VCH inventory list

Successful VCH Edit (future)
----------------------

1. From VCH view click 'Configure' tab
2. Using VCH edit wizard update the configureation of the VCH
3. Verify the VCH has been successfully updated with the new configurations

## Test cases
(TestCases.md)
